/**
 * dsh-remote-access — Client half (browser bundle).
 *
 * Registers two UI surfaces:
 *
 *   1. A settings card in `settings.plugin.item` (keyed by the namespace) —
 *      the five-section panel: page password, bcrypt hash generator, Caddy
 *      config generator, security audit, and beginner guide.
 *   2. A full-screen lock overlay in `shell.overlay` that blocks the page
 *      while the page lock is engaged and no valid token is stored.
 *
 * Both share one {@link RemoteAccessController} bound to the
 * `dsh-remote-access` settings namespace; the inject face feeds both
 * components with the same live state and actions.
 */

import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: pulls the settingsScope Context merge (ctx.settingsScope).
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-connection/client'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import './slot-contract.ts'
import { RemoteAccessCard, type RemoteAccessFace } from './card.tsx'
import { LockOverlay } from './lock-overlay.tsx'
import { injectStyles } from './styles.ts'
import { RemoteAccessController, realApi, type ClientSettings } from './controller.ts'

/** Settings namespace the Host registers (mirrored here as a plain string). */
const NS = 'dsh-remote-access'

/** Required client services (cordis fiber inject). */
export const inject = ['slots', 'settingsScope', 'connection', 'remote']

/**
 * Mount the settings card and the lock overlay.
 * @param ctx - the browser plugin context.
 */
export function apply(ctx: ClientContext): void {
  const scope = ctx.settingsScope.bind<ClientSettings>({ namespace: NS })
  const controller = new RemoteAccessController({
    scope,
    storage: typeof localStorage !== 'undefined' ? localStorage : memoryStorage(),
    api: realApi(),
    pageHostname: () => typeof location !== 'undefined' ? location.hostname : '',
    pageProtocol: () => typeof location !== 'undefined' ? location.protocol : '',
  })

  ctx.effect(() => controller.attach(), 'dsh-remote-access: scope subscription')
  ctx.effect(() => injectStyles(), 'dsh-remote-access: styles')

  const face = (): RemoteAccessFace => ({
    hooks: { remoteAccess: controller },
    verifyAndUnlock: (password) => controller.verifyAndUnlock(password),
    clearLocalToken: () => controller.clearLocalToken(),
    savePagePassword: (password) => controller.savePagePassword(password),
    disablePageLock: () => controller.disablePageLock(),
    generateHash: (password, rounds) => controller.generateHash(password, rounds),
    generateCaddyfile: () => controller.generateCaddyfile(),
    macCommand: () => controller.macCommand(),
    winCommand: () => controller.winCommand(),
    refreshAudit: () => controller.refreshAudit(),
    copyText: (text, label) => controller.copyText(text, label),
    setField: (field, value) => controller.setField(field, value),
  })

  ctx.effect(
    () =>
      ctx.slots.inject('settings.plugin.item', function* () {
        yield ctx.slots.register({
          name: 'settings.plugin.item',
          key: NS,
          inject: () => face(),
        }, RemoteAccessCard)
      }),
    'dsh-remote-access: settings card',
  )

  ctx.effect(
    () =>
      ctx.slots.inject('shell.overlay', function* () {
        yield ctx.slots.register({
          name: 'shell.overlay',
          id: 'dsh-remote-access-lock',
          order: 100000,
          inject: () => face(),
        }, LockOverlay)
      }),
    'dsh-remote-access: lock overlay',
  )
}

/** Non-persistent storage fallback for environments without localStorage. */
function memoryStorage(): Storage {
  const map = new Map<string, string>()
  return {
    get length() { return map.size },
    clear() { map.clear() },
    getItem(key: string) { return map.get(key) ?? null },
    key(index: number) { return [...map.keys()][index] ?? null },
    removeItem(key: string) { map.delete(key) },
    setItem(key: string, value: string) { map.set(key, String(value)) },
  }
}
