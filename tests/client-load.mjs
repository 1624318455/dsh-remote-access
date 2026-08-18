// Simulate the DSH browser boot: load lib/client.js via a ModuleLoader shim,
// then run apply() with stubbed services (slots/settingsScope/connection/remote)
// to prove the real bundle registers both slots without throwing.
import { readFileSync } from 'node:fs'
import { assert, assertEqual, summary } from './helpers.mjs'

const client = readFileSync(new URL('file:///Users/memeflyfly/Work/ForAI/dsh-remote-access/lib/client.js'), 'utf8')

const registrations = []
const slotsStub = {
  inject(key, cb) {
    const disposers = cb()
    for (const d of disposers) registrations.push({ key, d })
    return () => {}
  },
  register(opts, component) {
    registrations.push({ register: opts, component })
    return () => {}
  },
}
const scopeListeners = new Set()
const settingsScopeStub = {
  bind() {
    return {
      getSnapshot: () => ({ status: 'ready', value: { pageLockEnabled: true, tokenTtlHours: 72 }, writable: true }),
      subscribe: (fn) => { scopeListeners.add(fn); return () => scopeListeners.delete(fn) },
      set: async (f, v) => { console.log('  [scope.set]', f, String(v).slice(0, 12) + '…') },
      unset: async (f) => { console.log('  [scope.unset]', f) },
    }
  },
}
const ctx = {
  slots: slotsStub,
  settingsScope: settingsScopeStub,
  get: (k) => (k === 'slots' ? slotsStub : k === 'settingsScope' ? settingsScopeStub : undefined),
  effect: (fn, label) => { const d = fn(); console.log('  [effect]', label) },
}

// 1. Load the bundle through the ModuleLoader shim.
let entry
globalThis.window = { __ModuleLoader__: { load: (e) => { entry = e } } }
const fn = new Function('window', 'module', 'require', client)
const mod = { exports: {} }
fn(globalThis.window, mod, (id) => { throw new Error('unexpected require: ' + id) })
if (!entry) throw new Error('bundle did not register loader entry')
console.log('loader entry id:', entry.id)
assertEqual(entry.id, '@dsh-external/dsh-remote-access', 'loader entry id')

// 2. Run apply() — the factory needs the react externals the browser module
// table would provide; a minimal stub is enough since apply() never renders.
const reactStub = {
  createElement: (t, p, ...c) => ({ t, p, c }),
  useState: (init) => [init, () => {}],
  useEffect: () => {},
  useRef: () => ({ current: null }),
  Fragment: 'Fragment',
  jsx: (t, p) => ({ t, p }),
  jsxs: (t, p) => ({ t, p }),
}
const plugin = entry.factory((id) => {
  if (id === 'react') return reactStub
  if (id === 'react/jsx-runtime') return reactStub
  throw new Error('unexpected require: ' + id)
})
console.log('plugin keys:', Object.keys(plugin))
console.log('inject:', JSON.stringify(plugin.inject))
plugin.apply(ctx)
const names = registrations.map(r => r.register ? `${r.register.name}#${r.register.key ?? r.register.id}` : `inject:${r.key}`)
console.log('registrations:', names.join(', '))
assert(names.some(n => n === 'settings.plugin.item#dsh-remote-access'), 'settings card registered')
assert(names.some(n => n === 'shell.overlay#dsh-remote-access-lock'), 'lock overlay registered')
summary('client-load')
