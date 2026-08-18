/**
 * Smoke tests for dsh-remote-access — validate the built artifacts and the
 * injector's client-skeleton contract without touching the live harness:
 *
 *   1. lib/index.js + lib/client.js exist and are fresh vs src.
 *   2. Host half loads in Node and `apply()` registers both API routes.
 *   3. Client bundle has the ModuleLoader banner, declares `inject` incl.
 *      `slots`, and registers the two known slots (settings.plugin.item,
 *      shell.overlay) — the exact regexes the super-injector gate checks.
 *   4. package.json / cordis.patch.yml are well-formed.
 *   5. Client controller still works when bundled (load client.js in a Node
 *      shim that stubs `window.__ModuleLoader__`).
 */

import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { assert, assertEqual, summary } from './helpers.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

// --- 1. Artifacts exist and are fresh --------------------------------------
{
  const libIndex = join(ROOT, 'lib', 'index.js')
  const libClient = join(ROOT, 'lib', 'client.js')
  assert(existsSync(libIndex), 'lib/index.js exists')
  assert(existsSync(libClient), 'lib/client.js exists')

  const srcLatest = latestMtime(join(ROOT, 'src'))
  for (const [name, file] of [['index.js', libIndex], ['client.js', libClient]]) {
    const mtime = statSync(file).mtimeMs
    assert(mtime >= srcLatest - 5000, `${name} is fresh (built after last src edit)`)
  }
}

// --- 2. Host half loads and registers routes --------------------------------
{
  const mod = await import('../lib/index.js')
  assertEqual(mod.name, 'dsh-remote-access', 'host name')
  assert(Array.isArray(mod.inject) && mod.inject.includes('webServer'), 'host inject webServer')
  assert(typeof mod.Config === 'function', 'host Config schema')

  const registered = []
  const ctx = {
    webServer: {
      register(route) {
        registered.push(route)
        return () => {}
      },
    },
    get: () => undefined,
    effect: (fn) => fn(),
    inject: () => () => {},
  }
  mod.apply(ctx, {})
  const paths = registered.map((r) => r.path)
  assert(paths.includes('/dsh-remote-access/api/verify'), 'verify route registered')
  assert(paths.includes('/dsh-remote-access/api/audit'), 'audit route registered')
}

// --- 3. Client bundle injector-gate contract ---------------------------------
{
  const client = readFileSync(join(ROOT, 'lib', 'client.js'), 'utf8')

  // ModuleLoader banner (the tsdown wrap).
  assert(client.includes('window.__ModuleLoader__.load'), 'client bundle has ModuleLoader banner')
  assert(client.includes('@dsh-external/dsh-remote-access'), 'client bundle id is the package name')

  // `inject` array includes 'slots' — the exact regex the injector checks.
  assert(/inject\s*=\s*\[[^\]]*['"]slots['"]/.test(client), 'client bundle inject includes slots')

  // register() with a KNOWN slot name — settings.plugin.item / shell.overlay.
  assert(/register\(\{[\s\S]*?name:\s*['"]settings\.plugin\.item['"]/.test(client), 'settings.plugin.item registration present')
  assert(/register\(\{[\s\S]*?name:\s*['"]shell\.overlay['"]/.test(client), 'shell.overlay registration present')

  // No unexpected node builtins required by the client bundle.
  const forbidden = ['require("fs")', "require('fs')", 'require("child_process")', 'require("path")']
  for (const f of forbidden) assert(!client.includes(f), `client bundle must not ${f}`)
}

// --- 4. package.json / cordis.patch.yml well-formed ---------------------------
{
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
  assertEqual(pkg.name, '@dsh-external/dsh-remote-access', 'package name')
  assertEqual(pkg.main, './lib/index.js', 'main points at host bundle')
  assertEqual(pkg.exports['./client'], './lib/client.js', 'client export')
  assert(pkg.dsh?.bundle?.patch === './cordis.patch.yml', 'bundle patch declared')
  assert(Array.isArray(pkg.dsh?.client?.inject), 'client inject list declared')
  assert(pkg.dependencies?.bcryptjs, 'bcryptjs dependency declared')

  const patch = readFileSync(join(ROOT, 'cordis.patch.yml'), 'utf8')
  assert(patch.includes('- insert:'), 'patch has insert')
  assert(patch.includes("name: '@dsh-external/dsh-remote-access'"), 'patch names the package')
}

// --- 5. Client bundle executes under a ModuleLoader shim ----------------------
{
  const client = readFileSync(join(ROOT, 'lib', 'client.js'), 'utf8')
  let loaded
  globalThis.window = {
    __ModuleLoader__: {
      load(entry) {
        loaded = entry
      },
    },
  }
  // Execute the bundle (it only registers the loader entry; apply runs later
  // in the real browser once the module table is seeded).
  // Use a fresh function scope: the bundle references `window` and `module`.
  const fn = new Function('window', 'module', 'require', client)
  fn(globalThis.window, { exports: {} }, () => {
    throw new Error('client bundle must not require anything at load time')
  })
  assert(loaded && typeof loaded.id === 'string', 'client bundle registers loader entry')
  assertEqual(loaded.id, '@dsh-external/dsh-remote-access', 'loader entry id matches')
}

// ---------------------------------------------------------------------------
function latestMtime(dir) {
  let latest = 0
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name)
    if (entry.isDirectory()) latest = Math.max(latest, latestMtime(p))
    else if (/\.(ts|tsx)$/.test(entry.name)) latest = Math.max(latest, statSync(p).mtimeMs)
  }
  return latest
}

summary('smoke')
