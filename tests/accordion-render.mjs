/**
 * Accordion render test — bundles the REAL RemoteAccessCard React component
 * (plus its imports) with esbuild, then server-renders it with a stub
 * controller face, asserting the layered progressive-disclosure structure:
 *
 *   outer accordion (4 sections, one open at a time)
 *   └─ caddy section → inner step accordion (①②③)
 *
 * This exercises the JSX + useState code path that pure-logic tests cannot.
 */

import { execFileSync } from 'node:child_process'
import { writeFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { assert, assertEqual, summary } from './helpers.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const ESBUILD = join(ROOT, 'node_modules', '.bin', 'esbuild')

// 1. Bundle the card component (externalize react/react-dom, bundle everything
// else incl. the controller + locales + pure libs) to a temp .mjs inside the
// project tree so node can resolve the externalized react from node_modules.
const outDir = mkdtempSync(join(ROOT, '.tmp-render-'))
const outFile = join(outDir, 'card.mjs')
execFileSync(ESBUILD, [
  join(ROOT, 'src/client/card.tsx'),
  '--bundle',
  '--format=esm',
  '--platform=node',
  '--jsx=automatic',
  `--outfile=${outFile}`,
  '--external:react',
  '--external:react/jsx-runtime',
  '--external:react-dom/server',
  '--external:react-dom',
])

const { RemoteAccessCard } = await import(outFile)
const { renderToStaticMarkup } = await import('react-dom/server')
const { createElement } = await import('react')
const { defaultState } = await import('../src/client/controller.ts')

function makeProps(overrides = {}) {
  const state = { ...defaultState(), ...overrides }
  return {
    useRemoteAccess: (sel) => sel(state),
    setField: () => {},
    savePagePassword: async () => ({ ok: false, error: 'empty' }),
    disablePageLock: async () => {},
    clearLocalToken: () => {},
    verifyAndUnlock: async () => ({ ok: false, error: 'wrong' }),
    generateHash: async () => ({ ok: false, error: 'empty' }),
    generateCaddyfile: () => ({ ok: false, error: 'bad' }),
    macCommand: () => '# mac command\ncaddy run --config ./Caddyfile\n',
    winCommand: () => '# win command\n.\\caddy.exe run --config .\\Caddyfile\n',
    refreshAudit: async () => {},
    copyText: async () => true,
  }
}

function countOccurrences(html, needle) {
  return html.split(needle).length - 1
}

// --- default state: lock section open, no hash, no findings -----------------
{
  const html = renderToStaticMarkup(createElement(RemoteAccessCard, makeProps()))
  assert(html.includes('dra-card-head'), 'card header present')
  assert(html.includes('dra-acc-header'), 'accordion headers present')
  assertEqual(countOccurrences(html, 'dra-acc-item'), 4, 'exactly 4 outer accordion items')
  // Default: lock section open → its body renders (translated text).
  assert(html.includes('该模式仅保护网页'), 'lock section body visible by default')
  // Badges: lock off badge; caddy pending badge; audit unknown badge.
  assert(html.includes('页面锁未启用'), 'lock-off badge rendered')
  assert(html.includes('待生成哈希'), 'hash-pending badge rendered')
  assert(html.includes('待审计'), 'audit-unknown badge rendered')
  // Caddy inner steps hidden while the caddy section is closed.
  assert(!html.includes('生成 BCrypt 哈希'), 'caddy inner steps hidden while caddy closed')
}

// --- structure: inner step accordion markers exist ---------------------------
{
  const html = renderToStaticMarkup(createElement(RemoteAccessCard, makeProps()))
  assert(html.includes('公网安全配置'), 'caddy section title present')
}

// --- lock enabled state: badges flip to the "on" variants -------------------
{
  const html = renderToStaticMarkup(createElement(RemoteAccessCard, makeProps({
    pageLockEnabled: true,
    hashConfigured: true,
  })))
  assert(html.includes('页面锁已启用'), 'lock-on badge rendered when enabled')
  assert(!html.includes('页面锁未启用'), 'lock-off badge gone when enabled')
}

// --- hash generated: caddy badge flips ---------------------------------------
{
  const html = renderToStaticMarkup(createElement(RemoteAccessCard, makeProps({
    hashGenResult: '$2b$04$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZabcde',
  })))
  assert(html.includes('哈希已生成'), 'hash-ready badge rendered when hash exists')
  assert(!html.includes('待生成哈希'), 'hash-pending badge gone when hash exists')
}

// --- audit findings: danger badge ---------------------------------------------
{
  const html = renderToStaticMarkup(createElement(RemoteAccessCard, makeProps({
    auditFindings: [
      { severity: 'danger', key: 'audit.listenAllInterfaces', text: 'x' },
      { severity: 'ok', key: 'audit.listenLoopback', text: 'y' },
    ],
  })))
  assert(html.includes('项高危'), 'audit danger badge rendered with findings')
}

// --- remaining sections render their headers -----------------------------------
{
  const html = renderToStaticMarkup(createElement(RemoteAccessCard, makeProps()))
  assert(html.includes('页面密码锁 + Caddy'), 'card subtitle rendered')
  assert(html.includes('小白使用指引'), 'help section header present')
  assert(html.includes('安全风险审计'), 'audit section header present')
}

// --- interaction: opening the caddy section reveals inner steps -------------
{
  const { create, act } = await import('react-test-renderer')
  const props = makeProps({ hashGenResult: '$2b$04$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZabcde' })
  let tree
  await act(async () => {
    tree = create(createElement(RemoteAccessCard, props))
  })
  const root = tree.root

  // Default: lock section open, caddy closed → inner steps absent.
  const stepHeaders = root.findAll(node => node.props.className === 'dra-step-num')
  assertEqual(stepHeaders.length, 0, 'inner steps closed while caddy section closed')

  // Click the caddy section header (find the button whose title child contains 公网安全配置).
  const caddyHeader = root.findAll(node => {
    if (!node.props || node.props.className !== 'dra-acc-header') return false
    const titles = node.findAll(n => n.props && n.props.className === 'dra-acc-title')
    return titles.some(t => String(t.children ?? '').includes('公网安全配置'))
  })[0]
  assert(caddyHeader !== undefined, 'caddy header found')
  await act(async () => { caddyHeader.props.onClick() })

  // Now the inner accordion with ① ② ③ appears.
  const stepsAfter = root.findAll(node => node.props.className === 'dra-step-num')
  assertEqual(stepsAfter.length, 3, 'three inner step numbers after opening caddy')
  const innerTitles = root.findAll(node => node.props.className === 'dra-acc-title')
    .map(n => String(n.props.children ?? '').join?.('') ?? String(n.props.children))
  assert(innerTitles.some(t => t.includes('BCrypt 密码哈希')), 'step ① title present')
  assert(innerTitles.some(t => t.includes('Caddy 配置参数')), 'step ② title present')
  assert(innerTitles.some(t => t.includes('生成的 Caddyfile')), 'step ③ title present')

  // Inner step flow: typing a password enables 生成哈希. The component drives
  // `setField` through props, which the stub ignores — simulate by rebuilding
  // with a staged password so the button enables.
  const propsTyped = makeProps({ hashGenPassword: 'pw', hashGenResult: '$2b$04$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZabcde' })
  let tree2
  await act(async () => { tree2 = create(createElement(RemoteAccessCard, propsTyped)) })
  const caddyHeader2 = tree2.root.findAll(node => {
    if (!node.props || node.props.className !== 'dra-acc-header') return false
    const titles = node.findAll(n => n.props && n.props.className === 'dra-acc-title')
    return titles.some(t => String(t.children ?? '').includes('公网安全配置'))
  })[0]
  await act(async () => { caddyHeader2.props.onClick() })
  const generateBtn = tree2.root.findAll(node => {
    const p = node.props
    return p && p.className === 'dra-btn' && !p.disabled && String(p.children ?? '').includes('生成 bcrypt 哈希')
  })[0]
  assert(generateBtn !== undefined, 'generate-hash button present and enabled with password')
  tree2.unmount()
  tree.unmount()
}

summary('accordion-render')
