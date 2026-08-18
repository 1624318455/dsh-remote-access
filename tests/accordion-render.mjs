/**
 * Accordion render test — bundles the REAL RemoteAccessCard React component
 * (plus its imports) with esbuild, then drives it with react-test-renderer and
 * server-renders it, asserting the layered progressive-disclosure structure:
 *
 *   最外层卡片壳：DSH 远程访问鉴权（默认折叠，点击展开）
 *   └─ 内层折叠面板（一次展开一个模块）
 *       ├─ 页面访问密码（默认打开）
 *       ├─ 公网安全配置 → 内层步骤 1/2/3
 *       ├─ 安全风险审计
 *       └─ 小白使用指引
 *
 * This exercises the JSX + useState code path that pure-logic tests cannot.
 */

import { execFileSync } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { assert, assertEqual, summary } from './helpers.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const ESBUILD = join(ROOT, 'node_modules', '.bin', 'esbuild')

const outDir = mkdtempSync(join(ROOT, '.tmp-render-'))
const outFile = join(outDir, 'card.mjs')
execFileSync(ESBUILD, [
  join(ROOT, 'src/client/card.tsx'),
  '--bundle', '--format=esm', '--platform=node', '--jsx=automatic',
  `--outfile=${outFile}`,
  '--external:react', '--external:react/jsx-runtime', '--external:react-dom/server',
  '--external:react-dom', '--external:react-test-renderer',
])

const { RemoteAccessCard } = await import(outFile)
const { create, act } = await import('react-test-renderer')
const { createElement } = await import('react')
const { renderToStaticMarkup } = await import('react-dom/server')
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

async function mount(overrides = {}) {
  let tree
  await act(async () => {
    tree = create(createElement(RemoteAccessCard, makeProps(overrides)))
  })
  return tree
}

function findByClassName(root, cls) {
  return root.findAll(node => node.props && node.props.className === cls)
}

function headerWithTitle(root, titleFragment) {
  const headers = root.findAll(node => node.props && node.props.className === 'dra-acc-header')
  return headers.find(h => {
    const titles = h.findAll(n => n.props && n.props.className === 'dra-acc-title')
    return titles.some(t => String(t.children ?? '').includes(titleFragment))
  })
}

// --- 1. Outer shell: collapsed by default, click to reveal inner accordion --
{
  const tree = await mount()
  const root = tree.root

  // Outer card header present.
  const cardHeader = findByClassName(root, 'dra-card-header')[0]
  assert(cardHeader !== undefined, 'outer card header present')
  const nameText = cardHeader.findAll(n => n.props && n.props.className === 'dra-card-name')
  assert(nameText.some(n => String(n.children ?? '').includes('DSH 远程访问鉴权')), 'outer card name')
  assertEqual(cardHeader.props['aria-expanded'], false, 'outer card collapsed by default')

  // While collapsed: NO inner accordion items are rendered.
  assertEqual(findByClassName(root, 'dra-acc-item').length, 0, 'inner accordion hidden while card collapsed')
  assertEqual(findByClassName(root, 'dra-acc-body').length, 0, 'inner bodies hidden while card collapsed')

  // Click the outer header → inner accordion appears.
  await act(async () => { cardHeader.props.onClick() })
  assertEqual(findByClassName(root, 'dra-acc-item').length, 4, '4 inner sections after opening card')
  assertEqual(cardHeader.props['aria-expanded'], true, 'outer card expanded after click')

  // Default inner section: page password open (its body has the password input).
  const openBodies = findByClassName(root, 'dra-acc-body')
  assert(openBodies.length >= 1, 'at least one inner body open')
  const lockInputs = root.findAll(node =>
    node.props && node.props.className === 'dra-input' && node.props.placeholder === '输入页面访问密码（至少 4 位）')
  assert(lockInputs.length >= 1, 'page-password section open by default')
  tree.unmount()
}

// --- 2. Clicking the caddy section reveals the inner step accordion --------
{
  const tree = await mount()
  const root = tree.root
  // Open the card first.
  const cardHeader = findByClassName(root, 'dra-card-header')[0]
  await act(async () => { cardHeader.props.onClick() })

  // No step numbers until caddy section is opened.
  assertEqual(findByClassName(root, 'dra-step-num').length, 0, 'no steps before opening caddy')

  const caddyHeader = headerWithTitle(root, '公网安全配置')
  assert(caddyHeader !== undefined, 'caddy section header found')
  await act(async () => { caddyHeader.props.onClick() })

  // Now the 3 inner steps appear.
  const steps = findByClassName(root, 'dra-step-num')
  assertEqual(steps.length, 3, '3 inner step numbers after opening caddy')
  assertEqual(steps.map(n => String(n.children)).join(','), '1,2,3', 'step numbers are 1,2,3')

  const titles = root.findAll(n => n.props && n.props.className === 'dra-acc-title')
    .map(n => String(n.children ?? ''))
  assert(titles.some(t => t.includes('BCrypt 密码哈希')), 'step 1 title present')
  assert(titles.some(t => t.includes('Caddy 配置参数')), 'step 2 title present')
  assert(titles.some(t => t.includes('生成的 Caddyfile')), 'step 3 title present')

  tree.unmount()
}

// --- 3. Inner-section header badges ------------------------------------------
{
  // Lock enabled.
  const tree = await mount({ pageLockEnabled: true, hashConfigured: true })
  const root = tree.root
  const cardHeader = findByClassName(root, 'dra-card-header')[0]
  await act(async () => { cardHeader.props.onClick() })
  const badges = root.findAll(n => {
    const c = n.props && typeof n.props.className === 'string' ? n.props.className : ''
    return c.split(' ').includes('dra-acc-badge')
  }).map(n => String(n.children ?? '').trim())
  assert(badges.some(b => b.includes('页面锁已启用')), 'lock-on badge when enabled')
  assert(!badges.some(b => b.includes('页面锁未启用')), 'lock-off badge gone')
  tree.unmount()
}

// --- 3b. Hash generated → caddy badge flips ----------------------------------
{
  const tree = await mount({
    hashGenResult: '$2b$04$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZabcde',
  })
  const root = tree.root
  const cardHeader = findByClassName(root, 'dra-card-header')[0]
  await act(async () => { cardHeader.props.onClick() })
  const badges = root.findAll(n => {
    const c = n.props && typeof n.props.className === 'string' ? n.props.className : ''
    return c.split(' ').includes('dra-acc-badge')
  }).map(n => String(n.children ?? '').trim())
  assert(badges.some(b => b.includes('哈希已生成')), 'hash-ready badge when hash exists')
  assert(!badges.some(b => b.includes('待生成哈希')), 'hash-pending badge gone')
  tree.unmount()
}

// --- 4. Audit danger badge -----------------------------------------------------
{
  const tree = await mount({
    auditFindings: [
      { severity: 'danger', key: 'audit.listenAllInterfaces', text: 'x' },
      { severity: 'ok', key: 'audit.listenLoopback', text: 'y' },
    ],
  })
  const root = tree.root
  const cardHeader = findByClassName(root, 'dra-card-header')[0]
  await act(async () => { cardHeader.props.onClick() })
  const badges = root.findAll(n => {
    const c = n.props && typeof n.props.className === 'string' ? n.props.className : ''
    return c.split(' ').includes('dra-acc-badge')
  }).map(n => String(n.children ?? '').trim())
  assert(badges.some(b => b.includes('项高危')), 'audit danger badge with findings')
  tree.unmount()
}

// --- 5. Generate-hash button enables with password (flow wiring) ------------
{
  const tree = await mount({
    hashGenPassword: 'pw',
    hashGenResult: '$2b$04$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZabcde',
  })
  const root = tree.root
  const cardHeader = findByClassName(root, 'dra-card-header')[0]
  await act(async () => { cardHeader.props.onClick() })
  const caddyHeader = headerWithTitle(root, '公网安全配置')
  await act(async () => { caddyHeader.props.onClick() })

  const generateBtn = root.findAll(node => {
    const p = node.props
    return p && p.className === 'dra-btn' && !p.disabled && String(p.children ?? '').includes('生成 bcrypt 哈希')
  })[0]
  assert(generateBtn !== undefined, 'generate-hash button present and enabled with password')
  tree.unmount()
}

// --- 6. Pure server render: no emoji in any header text ----------------------
{
  const html = renderToStaticMarkup(createElement(RemoteAccessCard, makeProps()))
  // Rendered markup should contain zero emoji characters in card text.
  const emojiPattern = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u
  // The caret glyphs ▾▸ are arrows, not emoji; tolerate them. But the lock 🔒
  // and section emoji must be gone.
  const stripped = html.replace(/[▾▸✓]/g, '')
  assert(!emojiPattern.test(stripped), 'no emoji in rendered card markup')
}

summary('accordion-render')
