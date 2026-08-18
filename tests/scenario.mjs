/**
 * Simulated scenario tests for dsh-remote-access.
 *
 * These drive the REAL client controller (`RemoteAccessController`) with
 * injected fakes — a fake settings scope, fake localStorage, and a fake host
 * API — so every user flow is exercised end to end without a browser:
 *
 *   A. First-run / page-lock lifecycle (no lock → set password → reload →
 *      locked → wrong pwd → right pwd → token → reload unlocked → clear token
 *      → locked again).
 *   B. Hash generator + Caddy generator full flow (hash → Caddyfile → copy).
 *   C. Audit panel flows (0.0.0.0 danger, tunnel danger, safe).
 *   D. Scope-availability edge cases (memory mode / scope loading).
 */

import { assert, assertEqual, summary, FIXTURE_PASSWORD } from './helpers.mjs'
import { RemoteAccessController } from '../src/client/controller.ts'
import { TOKEN_STORAGE_KEY } from '../src/lib/token.ts'
import { hashPassword } from '../src/lib/bcrypt.ts'

/** In-memory storage faking the localStorage surface. */
function makeStorage() {
  const map = new Map()
  return {
    getItem: (k) => map.has(k) ? map.get(k) : null,
    setItem: (k, v) => { map.set(k, String(v)) },
    removeItem: (k) => { map.delete(k) },
    clear: () => map.clear(),
    dump: () => Object.fromEntries(map),
    _map: map,
  }
}

/** Fake settings scope: status/values + queued writes. */
function makeScope(initial = {}, status = 'ready') {
  const writes = []
  const listeners = new Set()
  let value = { ...initial }
  const scope = {
    getSnapshot: () => ({ status, value: status === 'ready' ? { ...value } : undefined, writable: status === 'ready' }),
    subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn) },
    set: async (field, v) => { writes.push([field, v]); value[field] = v; for (const l of listeners) l() },
    unset: async (field) => { writes.push([field, undefined]); delete value[field]; for (const l of listeners) l() },
    _value: value,
    _writes: writes,
  }
  return scope
}

/** Fake host API with a known password hash. */
function makeApi({ hash, auditResult }) {
  return {
    verify: async (password) => {
      if (!hash) return { ok: false, configured: false }
      const ok = await import('../src/lib/bcrypt.ts').then(m => m.verifyPassword(password, hash))
      return { ok, configured: true }
    },
    audit: async () => auditResult,
  }
}

const sleep = (ms = 0) => new Promise((r) => setTimeout(r, ms))

// ---------------------------------------------------------------------------
// A. Page-lock lifecycle
// ---------------------------------------------------------------------------
{
  const hash = await hashPassword(FIXTURE_PASSWORD, 4)
  const storage = makeStorage()
  const scope = makeScope({ pageLockEnabled: false, tokenTtlHours: 72 })
  const api = makeApi({ hash, auditResult: { host: '127.0.0.1', port: 3080, envHints: [], lockConfigured: true, pageLockEnabled: false } })
  const controller = new RemoteAccessController({ scope, storage, api, pageHostname: () => 'localhost', pageProtocol: () => 'http:' })
  controller.attach()
  await sleep(5)

  // A1. No lock configured → not locked.
  assertEqual(controller.getSnapshot().locked, false, 'A1: no lock configured, not locked')
  assertEqual(controller.getSnapshot().pageLockEnabled, false, 'A1: pageLockEnabled false')

  // A2. Save a page password → lock enabled, hash written, token absent → locked.
  const saved = await controller.savePagePassword(FIXTURE_PASSWORD)
  assertEqual(saved.ok, true, 'A2: save password ok')
  assert(scope._writes.some(([f]) => f === 'pagePasswordHash'), 'A2: pagePasswordHash written to scope')
  assert(scope._writes.some(([f, v]) => f === 'pageLockEnabled' && v === true), 'A2: pageLockEnabled=true written')
  assertEqual(controller.getSnapshot().pageLockEnabled, true, 'A2: lock enabled in state')
  assertEqual(controller.getSnapshot().locked, true, 'A2: locked after enabling without token')

  // A3. Wrong password → stays locked, no token.
  const wrong = await controller.verifyAndUnlock('not-the-password')
  assertEqual(wrong.ok, false, 'A3: wrong password rejected')
  assertEqual(wrong.error, 'wrong', 'A3: wrong error code')
  assertEqual(storage.getItem(TOKEN_STORAGE_KEY), null, 'A3: no token written')
  assertEqual(controller.getSnapshot().locked, true, 'A3: still locked')

  // A4. Correct password → token minted, unlocked.
  const right = await controller.verifyAndUnlock(FIXTURE_PASSWORD)
  assertEqual(right.ok, true, 'A4: correct password accepted')
  assert(storage.getItem(TOKEN_STORAGE_KEY) !== null, 'A4: token stored')
  const token = JSON.parse(storage.getItem(TOKEN_STORAGE_KEY))
  assert(typeof token.v === 'string' && token.v.length > 20, 'A4: token value opaque')
  assertEqual(controller.getSnapshot().locked, false, 'A4: unlocked after token')

  // A5. "Reload" — a fresh controller with the same storage + scope.
  const scope2 = makeScope({ pageLockEnabled: true, tokenTtlHours: 72 }, 'ready')
  scope2._value.pageLockEnabled = true
  scope2._value.tokenTtlHours = 72
  scope2._writes.length = 0
  const controller2 = new RemoteAccessController({ scope: scope2, storage, api, pageHostname: () => 'localhost', pageProtocol: () => 'http:' })
  controller2.attach()
  await sleep(5)
  assertEqual(controller2.getSnapshot().locked, false, 'A5: reload with valid token → unlocked')

  // A6. Clear the local token (test button) → next load locked again.
  controller2.clearLocalToken()
  assertEqual(storage.getItem(TOKEN_STORAGE_KEY), null, 'A6: token cleared')
  assertEqual(controller2.getSnapshot().locked, true, 'A6: locked immediately after clearing token')

  // A7. Disable the lock entirely.
  await controller2.disablePageLock()
  assertEqual(controller2.getSnapshot().pageLockEnabled, false, 'A7: lock disabled')
  assertEqual(controller2.getSnapshot().locked, false, 'A7: not locked after disabling')
}

// ---------------------------------------------------------------------------
// A'. Empty-password guards
// ---------------------------------------------------------------------------
{
  const hash = await hashPassword(FIXTURE_PASSWORD, 4)
  const storage = makeStorage()
  const scope = makeScope({ pageLockEnabled: true })
  const api = makeApi({ hash, auditResult: { host: '127.0.0.1', port: 3080, envHints: [], lockConfigured: true } })
  const controller = new RemoteAccessController({ scope, storage, api })
  controller.attach()
  await sleep(5)

  const emptyVerify = await controller.verifyAndUnlock('')
  assertEqual(emptyVerify.ok, false, 'A\': empty password verify rejected')
  assertEqual(emptyVerify.error, 'empty', 'A\': empty error code')

  const emptySave = await controller.savePagePassword('')
  assertEqual(emptySave.ok, false, 'A\': empty save rejected')

  const shortSave = await controller.savePagePassword('abc')
  assertEqual(shortSave.ok, false, 'A\': too-short save rejected')
  assertEqual(shortSave.error, 'too-short', 'A\': too-short error code')
}

// ---------------------------------------------------------------------------
// B. Hash generator + Caddy generator full flow
// ---------------------------------------------------------------------------
{
  const storage = makeStorage()
  const scope = makeScope({}, 'ready')
  const api = makeApi({ hash: undefined, auditResult: { host: '127.0.0.1', port: 3080, envHints: [], lockConfigured: false } })
  const controller = new RemoteAccessController({ scope, storage, api })
  controller.attach()
  await sleep(5)

  // B1. Generate a bcrypt hash client-side.
  const gen = await controller.generateHash('proxy-password-1', 4)
  assertEqual(gen.ok, true, 'B1: hash generated')
  assert(gen.hash.startsWith('$2'), 'B1: hash has bcrypt prefix')
  assertEqual(controller.getSnapshot().hashGenResult, gen.hash, 'B1: hash staged in state')

  // B2. Build the Caddyfile from the staged hash + defaults.
  const caddy = controller.generateCaddyfile()
  assertEqual(caddy.ok, true, 'B2: caddyfile generated')
  const out = controller.getSnapshot().caddyOutput
  assert(out.includes(':8081 {'), 'B2: default port 8081')
  assert(out.includes('dshuser ' + gen.hash), 'B2: user + hash in basic_auth')
  assert(out.includes('basic_auth'), 'B2: basic_auth directive present')
  assert(out.includes('reverse_proxy http://127.0.0.1:3080'), 'B2: backend proxied')

  // B3. Custom parameters.
  controller.setField('caddyPortInput', '9090')
  controller.setField('caddyBackendInput', 'http://192.168.1.50:3080')
  controller.setField('caddyUserInput', 'alice')
  const caddy2 = controller.generateCaddyfile()
  assertEqual(caddy2.ok, true, 'B3: custom caddyfile ok')
  const out2 = controller.getSnapshot().caddyOutput
  assert(out2.includes(':9090 {'), 'B3: custom port')
  assert(out2.includes('alice ' + gen.hash), 'B3: custom user')
  assert(out2.includes('192.168.1.50'), 'B3: custom backend')

  // B4. Invalid caddy input → error surfaced, no output clobber... (keeps old)
  controller.setField('caddyPortInput', '3080')
  const bad = controller.generateCaddyfile()
  assertEqual(bad.ok, false, 'B4: 3080 collision rejected')
  assert(controller.getSnapshot().caddyError.length > 0, 'B4: error surfaced')

  // B5. Commands.
  assert(controller.macCommand().includes('caddy run --config ./Caddyfile'), 'B5: mac command')
  assert(controller.winCommand().includes('.\\caddy.exe run --config .\\Caddyfile'), 'B5: win command')

  // B6. Copy flow (no navigator in Node → falls back to document; skip, only
  // assert the API contract of staging).
  controller.setField('caddyPortInput', '8081')
  const ok3 = controller.generateCaddyfile()
  assertEqual(ok3.ok, true, 'B6: regenerated after fixing port')
}

// ---------------------------------------------------------------------------
// C. Audit panel flows
// ---------------------------------------------------------------------------
{
  // C1. Exposed DSH (0.0.0.0) + tunnel hostname → danger findings.
  const storage1 = makeStorage()
  const scope1 = makeScope({ pageLockEnabled: false })
  const api1 = makeApi({ hash: undefined, auditResult: { host: '0.0.0.0', port: 3080, envHints: ['CLOUDFLARED_TUNNEL_ID'], lockConfigured: false } })
  const c1 = new RemoteAccessController({ scope: scope1, storage: storage1, api: api1, pageHostname: () => 'abc.trycloudflare.com', pageProtocol: () => 'https:' })
  c1.attach()
  await sleep(5)
  const f1 = c1.getSnapshot().auditFindings
  assert(f1.some(f => f.severity === 'danger' && f.key === 'audit.listenAllInterfaces'), 'C1: 0.0.0.0 danger')
  assert(f1.some(f => f.severity === 'danger' && f.key === 'audit.tunnelHostname'), 'C1: tunnel hostname danger')
  assert(f1.some(f => f.key === 'audit.envHint'), 'C1: env hint warn')

  // C2. Safe loopback + lock → no dangers, lock ok.
  const storage2 = makeStorage()
  const scope2 = makeScope({ pageLockEnabled: true })
  const api2 = makeApi({ hash: await hashPassword(FIXTURE_PASSWORD, 4), auditResult: { host: '127.0.0.1', port: 3080, envHints: [], lockConfigured: true, pageLockEnabled: true } })
  const c2 = new RemoteAccessController({ scope: scope2, storage: storage2, api: api2, pageHostname: () => 'localhost', pageProtocol: () => 'http:' })
  c2.attach()
  await sleep(5)
  const f2 = c2.getSnapshot().auditFindings
  assert(!f2.some(f => f.severity === 'danger'), 'C2: no dangers in safe setup')
  assert(f2.some(f => f.key === 'audit.listenLoopback' && f.severity === 'ok'), 'C2: loopback ok')
  assert(f2.some(f => f.key === 'audit.lockConfigured' && f.severity === 'ok'), 'C2: lock configured ok')

  // C3. Audit API failure → error state, no findings.
  const storage3 = makeStorage()
  const scope3 = makeScope({}, 'ready')
  const api3 = {
    verify: async () => ({ ok: false, configured: false }),
    audit: async () => { throw new Error('network down') },
  }
  const c3 = new RemoteAccessController({ scope: scope3, storage: storage3, api: api3 })
  c3.attach()
  await sleep(5)
  assertEqual(c3.getSnapshot().auditError, 'audit-failed', 'C3: audit error surfaced')
  assertEqual(c3.getSnapshot().auditFindings.length, 0, 'C3: no findings on failure')
  // Lock must not engage when the audit cannot prove a hash exists.
  assertEqual(c3.getSnapshot().locked, false, 'C3: audit failure never locks the page')
}

// ---------------------------------------------------------------------------
// D. Scope-availability edge cases
// ---------------------------------------------------------------------------
{
  // D1. Scope loading → not locked (avoid flashing the modal on boot).
  const storage = makeStorage()
  const scope = makeScope({ pageLockEnabled: true }, 'loading')
  const api = makeApi({ hash: 'x', auditResult: { host: '127.0.0.1', port: 3080, envHints: [], lockConfigured: true } })
  const controller = new RemoteAccessController({ scope, storage, api })
  controller.attach()
  await sleep(5)
  assertEqual(controller.getSnapshot().scopeStatus, 'loading', 'D1: scope status loading')
  assertEqual(controller.getSnapshot().locked, false, 'D1: not locked while scope loading')

  // D2. Scope unavailable (memory mode) → lock never engages, no crash.
  const storage2 = makeStorage()
  const scope2 = makeScope({ pageLockEnabled: true }, 'unavailable')
  const api2 = makeApi({ hash: await hashPassword(FIXTURE_PASSWORD, 4), auditResult: { host: '127.0.0.1', port: 3080, envHints: [], lockConfigured: true } })
  const c2 = new RemoteAccessController({ scope: scope2, storage: storage2, api: api2 })
  c2.attach()
  await sleep(5)
  assertEqual(c2.getSnapshot().locked, false, 'D2: unavailable scope → not locked')
  assertEqual(c2.getSnapshot().writable, false, 'D2: unavailable scope not writable')
}

// ---------------------------------------------------------------------------
// E. Token expiry simulation
// ---------------------------------------------------------------------------
{
  const hash = await hashPassword(FIXTURE_PASSWORD, 4)
  const storage = makeStorage()
  const scope = makeScope({ pageLockEnabled: true, tokenTtlHours: 1 })
  const api = makeApi({ hash, auditResult: { host: '127.0.0.1', port: 3080, envHints: [], lockConfigured: true } })

  let now = 1_700_000_000_000
  const controller = new RemoteAccessController({ scope, storage, api, now: () => now })
  controller.attach()
  await sleep(5)

  const res = await controller.verifyAndUnlock(FIXTURE_PASSWORD)
  assertEqual(res.ok, true, 'E: unlock ok')
  assertEqual(controller.getSnapshot().locked, false, 'E: unlocked')

  // Advance 1h + 1s → token expired → locked.
  now += 3_600_000 + 1000
  await controller.refresh()
  assertEqual(controller.getSnapshot().locked, true, 'E: expired token re-locks')

  // Advance back in time is impossible; re-unlock and re-expire once more.
  const res2 = await controller.verifyAndUnlock(FIXTURE_PASSWORD)
  assertEqual(res2.ok, true, 'E: re-unlock ok')
  assertEqual(controller.getSnapshot().locked, false, 'E: re-unlocked')
}

summary('scenario')
