/**
 * Client controller for dsh-remote-access — framework-free by design so the
 * whole lock/caddy/audit state machine is unit-testable in Node with injected
 * deps (fake scope, fake storage, fake fetch).
 *
 * The browser bundle wires it to the real settings scope (`ctx.settingsScope`),
 * localStorage, and the host API routes; tests wire fakes. No `@deepseek-ai`
 * runtime import lives here.
 */

import { createToken, isTokenValid, TOKEN_STORAGE_KEY, type PageLockToken } from '../lib/token.ts'
import { hashPassword, clampRounds } from '../lib/bcrypt.ts'
import {
  buildCaddyfile,
  macCommand,
  winCommand,
  CADDY_DEFAULT_PORT,
  CADDY_DEFAULT_BACKEND,
  CADDY_DEFAULT_USER,
  type CaddyfileInput,
} from '../lib/caddy.ts'
import { audit, type AuditFinding, type AuditInput } from '../lib/audit.ts'

/** Client mirror of the host settings (secret hash is intentionally absent). */
export interface ClientSettings {
  pageLockEnabled?: boolean
  tokenTtlHours?: number
  caddyPort?: number
  dshBackend?: string
  caddyUser?: string
  bcryptRounds?: number
}

/** Settings-scope surface the controller needs (client SettingsScope subset). */
export interface ScopeLike<T> {
  getSnapshot(): {
    status: 'loading' | 'ready' | 'unavailable'
    value: T | undefined
    writable: boolean
  }
  subscribe(fn: () => void): () => void
  set(field: string, value: unknown): Promise<void>
  unset(field: string): Promise<void>
}

/** Storage surface (localStorage subset). */
export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

/** Host API surface. */
export interface RemoteAccessApi {
  /** POST /dsh-remote-access/api/verify */
  verify(password: string): Promise<{ ok: boolean; configured: boolean }>
  /** GET /dsh-remote-access/api/audit */
  audit(): Promise<{
    host: string | null
    port: number | null
    envHints: string[]
    lockConfigured: boolean
    pageLockEnabled: boolean
    tokenTtlHours?: number
  }>
}

/** Snapshot store (minimal observable; satisfies the slot hooks seat). */
export interface SnapshotStoreLike<T> {
  getSnapshot(): T
  subscribe(fn: () => void): () => void
}

export interface RemoteAccessState {
  /** Settings-scope sync state. */
  scopeStatus: 'loading' | 'ready' | 'unavailable'
  /** Whether the scope accepts writes (memory mode never does). */
  writable: boolean
  /** Non-secret settings the card renders. */
  pageLockEnabled: boolean
  tokenTtlHours: number
  caddyPort: number
  dshBackend: string
  caddyUser: string
  bcryptRounds: number
  /** Whether the host reports a configured password hash. */
  hashConfigured: boolean
  /** Whether the page lock is currently engaged (blocks the app). */
  locked: boolean
  /** Card transient state. */
  pagePassword: string
  savingPassword: boolean
  passwordSaved: boolean
  passwordError: string
  hashGenPassword: string
  hashGenRounds: number
  hashGenResult: string
  hashGenError: string
  caddyPortInput: string
  caddyBackendInput: string
  caddyUserInput: string
  caddyOutput: string
  caddyError: string
  auditFindings: AuditFinding[]
  auditError: string
  /** Last copied text label for "已复制" feedback. */
  copied: string
}

/** Defaults mirroring the host code-level defaults. */
export function defaultState(): RemoteAccessState {
  return {
    scopeStatus: 'loading',
    writable: true,
    pageLockEnabled: false,
    tokenTtlHours: 72,
    caddyPort: CADDY_DEFAULT_PORT,
    dshBackend: CADDY_DEFAULT_BACKEND,
    caddyUser: CADDY_DEFAULT_USER,
    bcryptRounds: 12,
    hashConfigured: false,
    locked: false,
    pagePassword: '',
    savingPassword: false,
    passwordSaved: false,
    passwordError: '',
    hashGenPassword: '',
    hashGenRounds: 12,
    hashGenResult: '',
    hashGenError: '',
    caddyPortInput: String(CADDY_DEFAULT_PORT),
    caddyBackendInput: CADDY_DEFAULT_BACKEND,
    caddyUserInput: CADDY_DEFAULT_USER,
    caddyOutput: '',
    caddyError: '',
    auditFindings: [],
    auditError: '',
    copied: '',
  }
}

export interface RemoteAccessControllerOptions {
  scope: ScopeLike<ClientSettings>
  storage: StorageLike
  api: RemoteAccessApi
  /** Current page hostname (window.location.hostname); '' when unknown. */
  pageHostname?: () => string
  /** Current page protocol (window.location.protocol); '' when unknown. */
  pageProtocol?: () => string
  now?: () => number
}

/** Test hook: build the real host API over same-origin fetch. */
export function realApi(): RemoteAccessApi {
  return {
    async verify(password) {
      const res = await fetch('/dsh-remote-access/api/verify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json() as { ok?: boolean; configured?: boolean }
      return { ok: data.ok === true, configured: data.configured === true }
    },
    async audit() {
      const res = await fetch('/dsh-remote-access/api/audit')
      const data = await res.json() as {
        host?: string | null
        port?: number | null
        envHints?: string[]
        lockConfigured?: boolean
        pageLockEnabled?: boolean
        tokenTtlHours?: number
      }
      return {
        host: data.host ?? null,
        port: data.port ?? null,
        envHints: data.envHints ?? [],
        lockConfigured: data.lockConfigured === true,
        pageLockEnabled: data.pageLockEnabled === true,
        tokenTtlHours: data.tokenTtlHours,
      }
    },
  }
}

export class RemoteAccessController {
  private readonly scope: ScopeLike<ClientSettings>
  private readonly storage: StorageLike
  private readonly api: RemoteAccessApi
  private readonly pageHostname: () => string
  private readonly pageProtocol: () => string
  private readonly now: () => number
  private state: RemoteAccessState
  private readonly listeners = new Set<() => void>()

  constructor(options: RemoteAccessControllerOptions) {
    this.scope = options.scope
    this.storage = options.storage
    this.api = options.api
    this.pageHostname = options.pageHostname ?? (() => '')
    this.pageProtocol = options.pageProtocol ?? (() => '')
    this.now = options.now ?? (() => Date.now())
    this.state = defaultState()
  }

  // --- observable ----------------------------------------------------------
  getSnapshot(): RemoteAccessState {
    return this.state
  }

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn)
    return () => { this.listeners.delete(fn) }
  }

  private set(patch: Partial<RemoteAccessState>): void {
    this.state = { ...this.state, ...patch }
    for (const fn of this.listeners) fn()
  }

  // --- lifecycle -----------------------------------------------------------
  /** Subscribe to the settings scope and run an initial refresh. */
  attach(): () => void {
    const disposer = this.scope.subscribe(() => { void this.refresh() })
    void this.refresh()
    return disposer
  }

  /** Re-read scope + token + host audit and recompute the lock decision. */
  async refresh(): Promise<void> {
    const snapshot = this.scope.getSnapshot()
    const value = snapshot.value ?? {}
    this.set({
      scopeStatus: snapshot.status,
      writable: snapshot.writable,
      pageLockEnabled: value.pageLockEnabled === true,
      tokenTtlHours: value.tokenTtlHours ?? 72,
      caddyPort: value.caddyPort ?? CADDY_DEFAULT_PORT,
      dshBackend: value.dshBackend ?? CADDY_DEFAULT_BACKEND,
      caddyUser: value.caddyUser ?? CADDY_DEFAULT_USER,
      bcryptRounds: clampRounds(value.bcryptRounds),
    })
    await this.refreshAudit()
    this.recomputeLock()
  }

  /** Recompute `locked` from the last-known scope/audit/token facts. */
  private recomputeLock(): void {
    const token = this.readToken()
    const tokenValid = isTokenValid(token, this.now())
    // Lock engages when: scope ready, the lock is enabled, a hash actually
    // exists (avoid a lockout trap from enabling without saving), and no valid
    // token. While hashConfigured is still unknown (audit pending) we treat it
    // as configured — optimistic locking, released only if audit proves false.
    const hashConfigured = this.state.hashConfigured
    const locked = this.state.scopeStatus === 'ready'
      && this.state.pageLockEnabled
      && hashConfigured !== false
      && !tokenValid
    this.set({ locked, hashConfigured: hashConfigured === true || this.state.hashConfigured })
  }

  // --- token helpers --------------------------------------------------------
  private readToken(): PageLockToken | null {
    const raw = this.storage.getItem(TOKEN_STORAGE_KEY)
    if (raw === null) return null
    try {
      return JSON.parse(raw) as PageLockToken
    } catch {
      return null
    }
  }

  private writeToken(): void {
    const ttlHours = this.state.tokenTtlHours > 0 ? this.state.tokenTtlHours : 72
    const token = createToken(ttlHours, this.now())
    this.storage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(token))
  }

  /** Clear the local token (test button): next reload re-locks. */
  clearLocalToken(): void {
    this.storage.removeItem(TOKEN_STORAGE_KEY)
    this.recomputeLock()
    this.set({ copied: '' })
  }

  // --- page-lock actions -----------------------------------------------------
  /** Verify the entered password against the host; on success mint a token. */
  async verifyAndUnlock(password: string): Promise<{ ok: boolean; error?: string }> {
    if (password.length === 0) return { ok: false, error: 'empty' }
    try {
      const result = await this.api.verify(password)
      if (!result.ok) {
        if (!result.configured) return { ok: false, error: 'not-configured' }
        return { ok: false, error: 'wrong' }
      }
      this.writeToken()
      this.recomputeLock()
      return { ok: true }
    } catch {
      return { ok: false, error: 'network' }
    }
  }

  /** Compute the bcrypt hash in the browser and store it (enables the lock). */
  async savePagePassword(password: string): Promise<{ ok: boolean; error?: string }> {
    if (password.length === 0) return { ok: false, error: 'empty' }
    if (password.length < 4) return { ok: false, error: 'too-short' }
    this.set({ savingPassword: true, passwordSaved: false, passwordError: '' })
    try {
      const hash = await hashPassword(password, this.state.bcryptRounds)
      await this.scope.set('pagePasswordHash', hash)
      await this.scope.set('pageLockEnabled', true)
      this.set({ passwordSaved: true, pagePassword: '', savingPassword: false })
      await this.refresh()
      return { ok: true }
    } catch {
      this.set({ savingPassword: false, passwordError: 'write-failed' })
      return { ok: false, error: 'write-failed' }
    }
  }

  /** Turn the page lock off (clears the configured hash). */
  async disablePageLock(): Promise<void> {
    try {
      await this.scope.unset('pagePasswordHash')
      await this.scope.set('pageLockEnabled', false)
    } catch {
      // Best-effort; the card shows the persisted state after refresh.
    }
    await this.refresh()
  }

  // --- bcrypt hash generator -------------------------------------------------
  /** Pure client-side bcrypt hash generation (the Caddy password). */
  async generateHash(password: string, rounds: number): Promise<{ ok: boolean; hash?: string; error?: string }> {
    if (password.length === 0) return { ok: false, error: 'empty' }
    try {
      const hash = await hashPassword(password, rounds)
      this.set({ hashGenResult: hash, hashGenError: '', hashGenRounds: clampRounds(rounds) })
      return { ok: true, hash }
    } catch {
      this.set({ hashGenError: 'gen-failed' })
      return { ok: false, error: 'gen-failed' }
    }
  }

  // --- Caddy generator ---------------------------------------------------------
  /** Build the Caddyfile from the card inputs (uses the generated hash). */
  generateCaddyfile(): { ok: boolean; error?: string } {
    const input: CaddyfileInput = {
      port: this.state.caddyPortInput,
      hash: this.state.hashGenResult,
      backend: this.state.caddyBackendInput,
      user: this.state.caddyUserInput,
    }
    try {
      const output = buildCaddyfile(input)
      this.set({ caddyOutput: output, caddyError: '' })
      return { ok: true }
    } catch (error) {
      this.set({ caddyError: error instanceof Error ? error.message : String(error) })
      return { ok: false, error: String(error) }
    }
  }

  macCommand(): string {
    return macCommand()
  }

  winCommand(): string {
    return winCommand()
  }

  // --- audit -------------------------------------------------------------------
  /** Fetch host facts and classify the current exposure with the pure audit(). */
  async refreshAudit(): Promise<void> {
    try {
      const facts = await this.api.audit()
      const input: AuditInput = {
        listenHost: facts.host ?? undefined,
        listenPort: facts.port ?? undefined,
        pageHostname: this.pageHostname() || undefined,
        pageProtocol: this.pageProtocol() || undefined,
        envHints: facts.envHints,
        lockConfigured: facts.lockConfigured,
      }
      this.set({
        auditFindings: audit(input),
        auditError: '',
        hashConfigured: facts.lockConfigured,
      })
    } catch {
      this.set({ auditError: 'audit-failed', auditFindings: [] })
    }
  }

  // --- clipboard -----------------------------------------------------------------
  /** Copy text to the clipboard (navigator.clipboard with a textarea fallback). */
  async copyText(text: string, label: string): Promise<boolean> {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      this.set({ copied: label })
      return true
    } catch {
      this.set({ copied: '' })
      return false
    }
  }

  // --- input staging -----------------------------------------------------------------
  setField<K extends keyof RemoteAccessState>(field: K, value: RemoteAccessState[K]): void {
    this.set({ [field]: value } as Partial<RemoteAccessState>)
  }
}
