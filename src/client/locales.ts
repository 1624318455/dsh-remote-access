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
  'caddy.mac': '4. Mac 终端启动命令',
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

  // Section 4 — help (end-to-end flow: remote access from a mobile device)
  'help.section': '使用指引',
  'help.intro': '下面是一套能实际走通的完整流程：让手机等移动设备在非局域网（4G/5G/异地 WiFi）下，安全地远程访问这台电脑上的 DSH WebUI。每一步都配有可复制的命令和「预期结果」，照着做即可。',
  'help.mode.intro': '流程目标',
  'help.mode.inner': '本机：DSH 运行在 127.0.0.1:3080，只有本机自己能访问',
  'help.mode.caddy': '第 1 层（Caddy）：把 3080 包一层「账号密码」反向代理，监听 8081',
  'help.mode.tunnel': '第 2 层（cloudflared）：把 8081 通过免费的 https 地址映射到公网',
  'help.mode.result': '最终：手机打开生成的 https 链接 → 输入账号密码 → 进入你的 DSH',
  'help.phase0': '准备：确认本机状态',
  'help.p0a': '1. DS-H WebUI 正在运行，你能在浏览器打开 http://127.0.0.1:3080',
  'help.p0b': '2. 下面两个命令都是「前台运行」，请各自开一个独立终端窗口（不要占用 DSH 的终端，关掉它们会停止服务）',
  'help.p0c': '3. cloudflared 为免费工具，无需注册账号即可临时穿透；重启电脑后需重新手动开启',
  'help.phase1': '第 1 步 · 安装 Caddy 与 cloudflared',
  'help.installMac': 'Mac 安装（用 Homebrew，一条命令各装一个）：',
  'help.installMacCmd': 'brew install caddy cloudflared',
  'help.installWin': 'Windows 安装（到 GitHub Releases 下载解压，放进同一个文件夹）：',
  'help.installWin1': '• Caddy：https://github.com/caddyserver/caddy/releases 选 windows-amd64',
  'help.installWin2': '• cloudflared：https://github.com/cloudflare/cloudflared/releases 选 windows-amd64.exe，重命名为 cloudflared.exe',
  'help.verifyInstall': '预期结果：终端执行 caddy version 与 cloudflared --version 都能打印版本号',
  'help.phase2': '第 2 步 · 在插件里生成 Caddyfile 配置',
  'help.step2a': '1. 回到「公网安全配置」模块',
  'help.step2b': '2. 在「步骤 1」输入你的代理访问密码，点「生成 bcrypt 哈希」，复制生成的哈希',
  'help.step2c': '3. 在「步骤 2」填参数：代理端口用默认 8081、DSH 后端用默认 http://127.0.0.1:3080、账号用默认 dshuser，把上一步的哈希填进去',
  'help.step2d': '4. 点「生成完整 Caddyfile」，从「步骤 3」复制整段 Caddyfile 文本',
  'help.phase3': '第 3 步 · 保存 Caddyfile 并启动 Caddy',
  'help.saveMac': 'Mac 保存（在 Caddy 所在目录新建文件）',
  'help.saveMacCmd': 'cat > Caddyfile <<"EOF"\n（把上面复制的 Caddyfile 粘贴到这里）\nEOF',
  'help.saveWin': 'Windows 保存：新建文本文件，粘贴后另存为 Caddyfile（注意：文件类型选「所有文件」，关闭扩展名自动追加，文件名绝不能是 Caddyfile.txt）',
  'help.startMac': 'Mac 启动（在 Caddyfile 所在目录执行）',
  'help.startMacCmd': 'caddy run --config ./Caddyfile',
  'help.startWin': 'Windows 启动（在 caddy.exe 所在目录的 PowerShell 执行）',
  'help.startWinCmd': '.\caddy.exe run --config .\Caddyfile',
  'help.verifyCaddy': '预期结果：电脑浏览器打开 http://127.0.0.1:8081，会弹出「用户名/密码」输入框，用 dshuser + 你的代理密码能进入 DSH。这说明 Caddy 鉴权已生效。',
  'help.phase4': '第 4 步 · 用 cloudflared 把 8081 映射到公网',
  'help.tunnelIntro': '新开第 3 个终端，执行（指向 8081，不是 3080）：',
  'help.tunnel': 'cloudflared tunnel --url http://127.0.0.1:8081',
  'help.verifyTunnel': '预期结果：命令输出里会出现一行 https://xxx.trycloudflare.com，记下这个链接（免费临时地址）',
  'help.phase5': '第 5 步 · 手机远程访问',
  'help.mobileIntro': '1. 手机断开当前 WiFi（或用 4G/5G 数据），打开浏览器访问刚才记下的 https://xxx.trycloudflare.com 链接',
  'help.mobileAuth': '2. 浏览器会弹出「用户名/密码」，输入 dshuser 和你设置的代理密码',
  'help.mobileDone': '3. 进入 DSH 页面后，如果开了页面密码锁，再输入页面访问密码即可正常使用',
  'help.mobileResult': '完成！你现在在任何有网络的地方都能安全访问本机的 DSH。',
  'help.consolidate': '完整命令速查（Mac 对照）',
  'help.cmd1': '终端 1（本机 DSH）已运行 — 不需要动',
  'help.cmd2': '终端 2（Caddy）：caddy run --config ./Caddyfile',
  'help.cmd3': '终端 3（隧道）：cloudflared tunnel --url http://127.0.0.1:8081',
  'help.pitfalls': '常见坑（照做能避坑）：',
  'help.pitfall1': '1. Caddyfile 文件名不带任何后缀，Windows 别存成 Caddyfile.txt',
  'help.pitfall2': '2. cloudflared 隧道必须指向 8081（Caddy），不是 DSH 原始 3080',
  'help.pitfall3': '3. caddy 与 cloudflared 都在前台运行，各自占一个终端；关掉终端服务就停',
  'help.pitfall4': '4. 重启电脑后 caddy 和 cloudflared 都要重新手动启动',
  'help.pitfall5': '5. Windows 防火墙若拦截 8081，请在防火墙允许该端口',
  'help.pitfall6': '6. 手机连不上时先在本机浏览器验证 http://127.0.0.1:8081 是否弹账号密码（排除 Caddy 未启动）',
  'help.risk': '风险声明：本插件无法拦截后端 HTTP 接口；页面密码锁（等级 1）只适合内网信任环境。真正对外网开放时，必须用上面的 Caddy（等级 2）鉴权，严禁把 3080 直接暴露到公网。',
  'help.stepsDone': '以上 5 步全部满足预期结果即为走通；若某步未达预期，跳到「常见坑」对照排查。',

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
  'caddy.mac': '4. macOS terminal command',
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
  'help.section': 'Usage Guide',
  'help.intro': 'A complete, runnable flow: let a mobile device on a non-LAN network (4G/5G or remote WiFi) securely reach this computer\'s DSH WebUI. Every step has copyable commands and an "expected result" so you can validate as you go.',
  'help.mode.intro': 'Flow goal',
  'help.mode.inner': 'This machine: DSH runs on 127.0.0.1:3080, reachable only locally',
  'help.mode.caddy': 'Layer 1 (Caddy): wrap 3080 in a username/password reverse proxy listening on 8081',
  'help.mode.tunnel': 'Layer 2 (cloudflared): map 8081 to the public internet via a free https address',
  'help.mode.result': 'Result: open the generated https link on your phone, enter username/password, and reach your DSH',
  'help.phase0': 'Prepare: confirm your machine',
  'help.p0a': '1. DSH WebUI is running — you can open http://127.0.0.1:3080 in a browser',
  'help.p0b': '2. Both commands below run in the foreground — give each its own terminal window (don\'t reuse the DSH terminal; closing them stops the service)',
  'help.p0c': '3. cloudflared is free with no account needed for temporary tunneling; after a reboot you must restart it manually',
  'help.phase1': 'Step 1 · Install Caddy and cloudflared',
  'help.installMac': 'macOS installation (Homebrew, one command for both):',
  'help.installMacCmd': 'brew install caddy cloudflared',
  'help.installWin': 'Windows installation (download from GitHub Releases, extract into one folder):',
  'help.installWin1': '• Caddy: https://github.com/caddyserver/caddy/releases pick windows-amd64',
  'help.installWin2': '• cloudflared: https://github.com/cloudflare/cloudflared/releases pick windows-amd64.exe, rename to cloudflared.exe',
  'help.verifyInstall': 'Expected: caddy version and cloudflared --version both print a version number',
  'help.phase2': 'Step 2 · Generate the Caddyfile in this plugin',
  'help.step2a': '1. Go back to the "Public Security" module',
  'help.step2b': '2. In "Step 1" enter your proxy password, click "generate bcrypt hash", copy the hash',
  'help.step2c': '3. In "Step 2" fill the parameters: proxy port 8081 (default), DSH backend http://127.0.0.1:3080 (default), username dshuser (default), and paste the hash',
  'help.step2d': '4. Click "generate full Caddyfile" and copy the whole Caddyfile text from "Step 3"',
  'help.phase3': 'Step 3 · Save the Caddyfile and start Caddy',
  'help.saveMac': 'macOS save (create the file where Caddy lives)',
  'help.saveMacCmd': 'cat > Caddyfile <<"EOF"\n(paste the Caddyfile you copied here)\nEOF',
  'help.saveWin': 'Windows save: create a text file, paste, then Save As "Caddyfile" (file type "All files", no extension — never Caddyfile.txt)',
  'help.startMac': 'macOS start (in the directory containing the Caddyfile)',
  'help.startMacCmd': 'caddy run --config ./Caddyfile',
  'help.startWin': 'Windows start (PowerShell in the directory containing caddy.exe)',
  'help.startWinCmd': '.\caddy.exe run --config .\Caddyfile',
  'help.verifyCaddy': 'Expected: opening http://127.0.0.1:8081 in a browser shows a username/password prompt; entering dshuser + your proxy password reaches DSH. Caddy auth is live.',
  'help.phase4': 'Step 4 · Expose 8081 to the internet via cloudflared',
  'help.tunnelIntro': 'Open a 3rd terminal and run (point at 8081, not 3080):',
  'help.tunnel': 'cloudflared tunnel --url http://127.0.0.1:8081',
  'help.verifyTunnel': 'Expected: the output shows a line like https://xxx.trycloudflare.com — note this link (free temporary address)',
  'help.phase5': 'Step 5 · Access from your phone',
  'help.mobileIntro': '1. Disconnect your phone from local WiFi (or use 4G/5G) and open the https://xxx.trycloudflare.com link in a browser',
  'help.mobileAuth': '2. A username/password prompt appears — enter dshuser and your proxy password',
  'help.mobileDone': '3. If the page lock is enabled, enter the page password as well and use DSH normally',
  'help.mobileResult': 'Done! You can now securely reach your DSH from anywhere with internet.',
  'help.consolidate': 'Quick command reference (macOS)',
  'help.cmd1': 'Terminal 1 (local DSH): already running — leave it',
  'help.cmd2': 'Terminal 2 (Caddy): caddy run --config ./Caddyfile',
  'help.cmd3': 'Terminal 3 (tunnel): cloudflared tunnel --url http://127.0.0.1:8081',
  'help.pitfalls': 'Common pitfalls (avoid by following):',
  'help.pitfall1': '1. The Caddyfile must have no extension — on Windows never save Caddyfile.txt',
  'help.pitfall2': '2. The cloudflared tunnel must point at 8081 (Caddy), not DSH\'s original 3080',
  'help.pitfall3': '3. caddy and cloudflared both run in the foreground, each in its own terminal; closing the terminal stops the service',
  'help.pitfall4': '4. After a reboot you must restart caddy and cloudflared manually',
  'help.pitfall5': '5. If Windows Firewall blocks 8081, allow that port',
  'help.pitfall6': '6. Can\'t connect on your phone? First verify http://127.0.0.1:8081 shows the auth prompt on this machine (rules out Caddy not running)',
  'help.risk': 'Risk statement: this plugin cannot intercept backend HTTP endpoints; the page lock (level 1) is only for trusted LAN environments. For real internet exposure you must use the Caddy layer (level 2) auth above — never expose 3080 directly.',
  'help.stepsDone': 'The flow is complete once all 5 steps meet their expected result; if any step fails, check "Common pitfalls" to troubleshoot.',
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
