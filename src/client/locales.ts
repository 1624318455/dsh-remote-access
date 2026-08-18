/**
 * Minimal inline i18n for dsh-remote-access (zh primary + en fallback).
 * Self-contained: no locale-service dependency, resolvable in Node tests.
 */

export type Lang = 'zh' | 'en'

export interface Dict {
  [key: string]: string
}

const zh: Dict = {
  // Card outer shell (websearch-style collapsible card)
  'card.title': 'DSH 远程访问鉴权',
  'card.subtitle': '页面密码锁 + Caddy 反向代理配置生成（纯字符串输出，插件不写文件、不启动程序）',

  // Section 1 — page lock
  'lock.section': '页面访问密码（安全等级 1 · 内网模式）',
  'lock.warning': '警告：该模式仅保护网页，/api 与 /ws 接口仍然裸露，禁止公网穿透，仅限内网可信环境使用。',
  'lock.status.on': '页面锁：已启用',
  'lock.status.off': '页面锁：未启用',
  'lock.status.hash': '密码哈希：已配置',
  'lock.status.nohash': '密码哈希：未配置',
  'lock.setPassword': '设置页面密码',
  'lock.passwordPlaceholder': '输入页面访问密码（至少 4 位）',
  'lock.save': '保存密码',
  'lock.saving': '保存中…',
  'lock.saved': '✓ 已保存并启用页面锁（刷新后生效）',
  'lock.clearToken': '清除本地授权 token（测试用）',
  'lock.error.empty': '密码不能为空',
  'lock.error.tooShort': '密码至少 4 位',
  'lock.error.writeFailed': '保存失败：设置写入被拒绝',
  'lock.disable': '关闭页面锁',
  'lock.disableHint': '关闭后任何人打开网页无需密码（仍可随时重新开启）',

  // Section 2 — Caddy / public
  'caddy.section': '公网安全配置（安全等级 2 · 需要 Caddy 反向代理）',
  'caddy.warning': '重要：本插件不会自动下载或运行 Caddy，以下内容均为文本，复制后需手动操作。',
  'caddy.hashTitle': '步骤 1 · 生成 BCrypt 密码哈希（浏览器本地计算，明文不出本机）',
  'caddy.hashPassword': '代理访问密码',
  'caddy.hashRounds': '轮数',
  'caddy.generateHash': '生成 bcrypt 哈希',
  'caddy.hashResult': '生成的哈希（粘贴到 Caddyfile / 上一步）',
  'caddy.copyHash': '复制哈希',
  'caddy.paramsTitle': '步骤 2 · Caddy 配置参数',
  'caddy.port': '代理监听端口（默认 8081，不要用 3080）',
  'caddy.backend': 'DSH 后端地址（默认 http://127.0.0.1:3080）',
  'caddy.user': '账号（默认 dshuser）',
  'caddy.generateFile': '生成完整 Caddyfile',
  'caddy.fileTitle': '步骤 3 · 生成的 Caddyfile 与启动命令',
  'caddy.copyFile': '一键复制 Caddyfile',
  'caddy.fileError': '生成失败：',
  'caddy.mac': '④ Mac 终端启动命令',
  'caddy.win': '⑤ Windows PowerShell 启动命令',
  'caddy.copyMac': '复制 Mac 命令',
  'caddy.copyWin': '复制 Windows 命令',
  'caddy.hashFirst': '请先在上方生成 bcrypt 哈希',

  // Section 3 — audit
  'audit.section': '安全风险审计',
  'audit.desc': '以下结论由插件在浏览器内基于宿主信息计算，仅供参考。',
  'audit.listen': '当前 DSH 监听地址：',
  'audit.unknown': '未知（审计接口不可用）',
  'audit.error': '审计信息获取失败',
  'audit.refresh': '重新审计',

  // Section 4 — help
  'help.section': '小白使用指引',
  'help.intro': 'Caddy 是一个自动 HTTPS 的反向代理，配合本插件生成的配置即可为 DSH 提供真正的接口鉴权。',
  'help.download': '第 1 步 · 下载 Caddy 二进制（免费）',
  'help.downloadMac': 'Mac：brew install caddy（或到 GitHub Releases 下载 darwin-arm64 / darwin-amd64）',
  'help.downloadWin': 'Windows：到 GitHub Releases 下载 windows-amd64，解压即用（无需安装）',
  'help.github': 'GitHub Releases：https://github.com/caddyserver/caddy/releases',
  'help.step2': '第 2 步 · 生成哈希并填写参数，点击「生成完整 Caddyfile」，把输出保存为文件：',
  'help.step2Mac': 'Mac：保存到 caddy 所在目录，文件名 Caddyfile（无后缀）',
  'help.step2Win': 'Windows：保存为 Caddyfile（注意系统不要自动追加 .txt 后缀）',
  'help.step3': '第 3 步 · 打开终端运行对应启动命令（复制上面的命令）',
  'help.step4': '④ 验证：浏览器访问 http://127.0.0.1:8081，应弹出账号密码框',
  'help.step5': '⑤ 公网穿透时，cloudflared 隧道指向 8081 而非 3080：',
  'help.tunnel': 'cloudflared tunnel --url http://127.0.0.1:8081',
  'help.pitfalls': '常见坑：',
  'help.pitfall1': '1. Windows 保存 Caddyfile 别带 .txt 后缀，文件名就是 Caddyfile',
  'help.pitfall2': '2. caddy / cloudflared 必须新开独立终端，不能占用 DSH 进程',
  'help.pitfall3': '3. 隧道目标地址是代理端口 8081，不是 DSH 原始 3080',
  'help.pitfall4': '4. 重启电脑后 caddy / cloudflared 需要重新手动启动',
  'help.pitfall5': '5. Windows 防火墙可能拦截 8081，需允许访问',
  'help.risk': '风险声明：本插件无法拦截后端 HTTP 接口；页面密码锁（等级 1）只适合内网信任环境，严禁直接公网穿透。',

  // Audit findings (severity labels + fallback text lives in the audit lib)
  'audit.severity.danger': '高危',
  'audit.severity.warn': '警告',
  'audit.severity.ok': '正常',

  // Overlay
  'overlay.title': 'DSH 已锁定',
  'overlay.desc': '请输入页面访问密码以继续',
  'overlay.placeholder': '页面访问密码',
  'overlay.unlock': '解锁',
  'overlay.unlocking': '验证中…',
  'overlay.error.wrong': '密码错误',
  'overlay.error.empty': '请输入密码',
  'overlay.error.network': '验证服务不可用，请稍后重试',
  'overlay.error.notConfigured': '页面锁未配置密码：请先到插件设置中保存密码，或关闭页面锁',
  'overlay.hint': '安全等级 1：仅保护网页，API/WebSocket 未受保护，禁止公网穿透',
  'overlay.hint2': '忘记密码？请修改 DSH 配置（移除 pagePasswordHash）或卸载插件后重新配置',

  // Copied feedback

  // Accordion header badges
  'badge.lockOn': '页面锁已启用',
  'badge.lockOff': '页面锁未启用',
  'badge.hashReady': '哈希已生成',
  'badge.hashPending': '待生成哈希',
  'badge.auditSafe': '审计正常',
  'badge.auditDanger': '{n} 项高危',
  'badge.auditUnknown': '待审计',

  'copied': '已复制',
}

const en: Dict = {
  'card.title': 'DSH Remote Access Auth',
  'card.subtitle': 'Page lock + Caddy reverse-proxy config generator (pure text output — the plugin never writes files or starts programs)',
  'lock.section': 'Page Access Password (Level 1 · LAN mode)',
  'lock.warning': 'Warning: this mode protects the web page ONLY — /api and /ws endpoints stay exposed. Never tunnel to the public internet; LAN trusted environments only.',
  'lock.status.on': 'Page lock: ENABLED',
  'lock.status.off': 'Page lock: disabled',
  'lock.status.hash': 'Password hash: configured',
  'lock.status.nohash': 'Password hash: not configured',
  'lock.setPassword': 'Set page password',
  'lock.passwordPlaceholder': 'Page access password (min 4 chars)',
  'lock.save': 'Save password',
  'lock.saving': 'Saving…',
  'lock.saved': '✓ Saved and page lock enabled (takes effect after reload)',
  'lock.clearToken': 'Clear local auth token (for testing)',
  'lock.error.empty': 'Password must not be empty',
  'lock.error.tooShort': 'Password must be at least 4 characters',
  'lock.error.writeFailed': 'Save failed: settings write refused',
  'lock.disable': 'Disable page lock',
  'lock.disableHint': 'When disabled anyone can open the page without a password (you can re-enable anytime)',
  'caddy.section': 'Public Security (Level 2 · needs Caddy reverse proxy)',
  'caddy.warning': 'Important: this plugin never downloads or runs Caddy. Everything below is text — copy it and act manually.',
  'caddy.hashTitle': 'Step 1 · Generate a BCrypt password hash (computed locally in your browser)',
  'caddy.hashPassword': 'Proxy access password',
  'caddy.hashRounds': 'Rounds',
  'caddy.generateHash': 'Generate bcrypt hash',
  'caddy.hashResult': 'Generated hash (paste into the Caddyfile below)',
  'caddy.copyHash': 'Copy hash',
  'caddy.paramsTitle': 'Step 2 · Caddy parameters',
  'caddy.port': 'Proxy listen port (default 8081, do not use 3080)',
  'caddy.backend': 'DSH backend URL (default http://127.0.0.1:3080)',
  'caddy.user': 'Username (default dshuser)',
  'caddy.generateFile': 'Generate full Caddyfile',
  'caddy.fileTitle': 'Step 3 · Generated Caddyfile & start commands',
  'caddy.copyFile': 'Copy Caddyfile',
  'caddy.fileError': 'Generation failed: ',
  'caddy.mac': '④ macOS terminal command',
  'caddy.win': '⑤ Windows PowerShell command',
  'caddy.copyMac': 'Copy macOS command',
  'caddy.copyWin': 'Copy Windows command',
  'caddy.hashFirst': 'Generate a bcrypt hash above first',
  'audit.section': 'Security Risk Audit',
  'audit.desc': 'Conclusions below are computed in your browser from host facts — advisory only.',
  'audit.listen': 'DSH currently listens on: ',
  'audit.unknown': 'unknown (audit endpoint unavailable)',
  'audit.error': 'Failed to fetch audit info',
  'audit.refresh': 'Re-audit',
  'help.section': 'Beginner Guide',
  'help.intro': 'Caddy is a reverse proxy with automatic HTTPS. Combined with the config this plugin generates, it provides real API-level authentication for DSH.',
  'help.download': 'Step 1 · Download the Caddy binary (free)',
  'help.downloadMac': 'macOS: brew install caddy (or grab darwin-arm64 / darwin-amd64 from GitHub Releases)',
  'help.downloadWin': 'Windows: grab windows-amd64 from GitHub Releases, extract and run (no install)',
  'help.github': 'GitHub Releases: https://github.com/caddyserver/caddy/releases',
  'help.step2': 'Step 2 · Generate a hash, fill the parameters, click “Generate full Caddyfile”, save the output as a file:',
  'help.step2Mac': 'macOS: save next to the caddy binary, file name Caddyfile (no extension)',
  'help.step2Win': 'Windows: save as Caddyfile (make sure the system does not append .txt)',
  'help.step3': 'Step 3 · Open a terminal and run the matching command (copied above)',
  'help.step4': '④ Verify: open http://127.0.0.1:8081 — a username/password prompt should appear',
  'help.step5': '⑤ For public tunneling, point cloudflared at 8081, not 3080:',
  'help.tunnel': 'cloudflared tunnel --url http://127.0.0.1:8081',
  'help.pitfalls': 'Common pitfalls:',
  'help.pitfall1': '1. On Windows save the file as Caddyfile, never Caddyfile.txt',
  'help.pitfall2': '2. Run caddy / cloudflared in a separate terminal — never inside the DSH process',
  'help.pitfall3': '3. The tunnel target is the proxy port 8081, not DSH’s original 3080',
  'help.pitfall4': '4. After a reboot you must restart caddy / cloudflared manually',
  'help.pitfall5': '5. Windows Firewall may block 8081 — allow it',
  'help.risk': 'Risk statement: this plugin cannot intercept backend HTTP endpoints; the page lock (level 1) is only for trusted LAN environments — never expose it directly to the public internet.',
  'audit.severity.danger': 'HIGH RISK',
  'audit.severity.warn': 'WARNING',
  'audit.severity.ok': 'OK',
  'overlay.title': 'DSH is locked',
  'overlay.desc': 'Enter the page access password to continue',
  'overlay.placeholder': 'Page access password',
  'overlay.unlock': 'Unlock',
  'overlay.unlocking': 'Verifying…',
  'overlay.error.wrong': 'Wrong password',
  'overlay.error.empty': 'Enter the password',
  'overlay.error.network': 'Verification service unavailable, try again later',
  'overlay.error.notConfigured': 'Page lock has no password configured: save one in the plugin settings, or disable the lock',
  'overlay.hint': 'Level 1: protects the page only — API/WebSocket stay exposed, no public tunneling',
  'overlay.hint2': 'Forgot the password? Edit the DSH config (remove pagePasswordHash) or uninstall the plugin to reconfigure',

  // Accordion header badges
  'badge.lockOn': 'Lock enabled',
  'badge.lockOff': 'Lock off',
  'badge.hashReady': 'Hash ready',
  'badge.hashPending': 'No hash yet',
  'badge.auditSafe': 'Audit OK',
  'badge.auditDanger': '{n} high-risk',
  'badge.auditUnknown': 'Not audited',

  'copied': 'Copied',
}

const dicts: Record<Lang, Dict> = { zh, en }

export function resolveLang(pref: string | undefined): Lang {
  if (pref === 'zh' || pref === 'en') return pref
  let code = ''
  try { code = String(navigator?.language ?? '') } catch { /* non-fatal */ }
  return /^zh/i.test(code) ? 'zh' : 'en'
}

/** Translate a key, substituting {name} placeholders; falls back to en → key. */
export function translate(lang: Lang, key: string, params?: Record<string, string | number>): string {
  const table = dicts[lang] ?? en
  let text = table[key] ?? en[key] ?? key
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      text = text.split(`{${name}}`).join(String(value))
    }
  }
  return text
}

export const DICTS = { zh, en }
