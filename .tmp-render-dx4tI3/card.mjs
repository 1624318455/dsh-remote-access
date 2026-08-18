// src/client/card.tsx
import { useState } from "react";

// src/client/locales.ts
var zh = {
  // Card title
  "card.title": "DSH \u8FDC\u7A0B\u8BBF\u95EE\u9274\u6743",
  "card.subtitle": "\u9875\u9762\u5BC6\u7801\u9501 + Caddy \u53CD\u5411\u4EE3\u7406\u914D\u7F6E\u751F\u6210\uFF08\u7EAF\u5B57\u7B26\u4E32\u8F93\u51FA\uFF0C\u63D2\u4EF6\u4E0D\u5199\u6587\u4EF6\u3001\u4E0D\u542F\u52A8\u7A0B\u5E8F\uFF09",
  // Section 1 — page lock
  "lock.section": "\u{1F510} \u9875\u9762\u8BBF\u95EE\u5BC6\u7801\uFF08\u5B89\u5168\u7B49\u7EA7 1 \xB7 \u5185\u7F51\u6A21\u5F0F\uFF09",
  "lock.warning": "\u26A0\uFE0F \u8BE5\u6A21\u5F0F\u4EC5\u4FDD\u62A4\u7F51\u9875\uFF0C/api \u4E0E /ws \u63A5\u53E3\u4ECD\u7136\u88F8\u9732\uFF0C\u7981\u6B62\u516C\u7F51\u7A7F\u900F\uFF0C\u4EC5\u9650\u5185\u7F51\u53EF\u4FE1\u73AF\u5883\u4F7F\u7528\u3002",
  "lock.status.on": "\u9875\u9762\u9501\uFF1A\u5DF2\u542F\u7528",
  "lock.status.off": "\u9875\u9762\u9501\uFF1A\u672A\u542F\u7528",
  "lock.status.hash": "\u5BC6\u7801\u54C8\u5E0C\uFF1A\u5DF2\u914D\u7F6E",
  "lock.status.nohash": "\u5BC6\u7801\u54C8\u5E0C\uFF1A\u672A\u914D\u7F6E",
  "lock.setPassword": "\u8BBE\u7F6E\u9875\u9762\u5BC6\u7801",
  "lock.passwordPlaceholder": "\u8F93\u5165\u9875\u9762\u8BBF\u95EE\u5BC6\u7801\uFF08\u81F3\u5C11 4 \u4F4D\uFF09",
  "lock.save": "\u4FDD\u5B58\u5BC6\u7801",
  "lock.saving": "\u4FDD\u5B58\u4E2D\u2026",
  "lock.saved": "\u2713 \u5DF2\u4FDD\u5B58\u5E76\u542F\u7528\u9875\u9762\u9501\uFF08\u5237\u65B0\u540E\u751F\u6548\uFF09",
  "lock.clearToken": "\u6E05\u9664\u672C\u5730\u6388\u6743 token\uFF08\u6D4B\u8BD5\u7528\uFF09",
  "lock.error.empty": "\u5BC6\u7801\u4E0D\u80FD\u4E3A\u7A7A",
  "lock.error.tooShort": "\u5BC6\u7801\u81F3\u5C11 4 \u4F4D",
  "lock.error.writeFailed": "\u4FDD\u5B58\u5931\u8D25\uFF1A\u8BBE\u7F6E\u5199\u5165\u88AB\u62D2\u7EDD",
  "lock.disable": "\u5173\u95ED\u9875\u9762\u9501",
  "lock.disableHint": "\u5173\u95ED\u540E\u4EFB\u4F55\u4EBA\u6253\u5F00\u7F51\u9875\u65E0\u9700\u5BC6\u7801\uFF08\u4ECD\u53EF\u968F\u65F6\u91CD\u65B0\u5F00\u542F\uFF09",
  // Section 2 — Caddy / public
  "caddy.section": "\u{1F6E1}\uFE0F \u516C\u7F51\u5B89\u5168\u914D\u7F6E\uFF08\u5B89\u5168\u7B49\u7EA7 2 \xB7 \u9700\u8981 Caddy \u53CD\u5411\u4EE3\u7406\uFF0C\u63A8\u8350\u516C\u7F51\u4F7F\u7528\uFF09",
  "caddy.warning": "\u26A0\uFE0F \u672C\u63D2\u4EF6\u4E0D\u4F1A\u81EA\u52A8\u4E0B\u8F7D\u6216\u8FD0\u884C Caddy\uFF0C\u4EE5\u4E0B\u5185\u5BB9\u5747\u4E3A\u6587\u672C\uFF0C\u590D\u5236\u540E\u9700\u624B\u52A8\u64CD\u4F5C\u3002",
  "caddy.hashTitle": "\u2460 \u751F\u6210 BCrypt \u5BC6\u7801\u54C8\u5E0C\uFF08\u6D4F\u89C8\u5668\u672C\u5730\u8BA1\u7B97\uFF0C\u660E\u6587\u4E0D\u51FA\u672C\u673A\uFF09",
  "caddy.hashPassword": "\u4EE3\u7406\u8BBF\u95EE\u5BC6\u7801",
  "caddy.hashRounds": "\u8F6E\u6570",
  "caddy.generateHash": "\u751F\u6210 bcrypt \u54C8\u5E0C",
  "caddy.hashResult": "\u751F\u6210\u7684\u54C8\u5E0C\uFF08\u7C98\u8D34\u5230 Caddyfile / \u4E0A\u4E00\u6B65\uFF09",
  "caddy.copyHash": "\u590D\u5236\u54C8\u5E0C",
  "caddy.paramsTitle": "\u2461 Caddy \u914D\u7F6E\u53C2\u6570",
  "caddy.port": "\u4EE3\u7406\u76D1\u542C\u7AEF\u53E3\uFF08\u9ED8\u8BA4 8081\uFF0C\u4E0D\u8981\u7528 3080\uFF09",
  "caddy.backend": "DSH \u540E\u7AEF\u5730\u5740\uFF08\u9ED8\u8BA4 http://127.0.0.1:3080\uFF09",
  "caddy.user": "\u8D26\u53F7\uFF08\u9ED8\u8BA4 dshuser\uFF09",
  "caddy.generateFile": "\u751F\u6210\u5B8C\u6574 Caddyfile",
  "caddy.fileTitle": "\u2462 \u751F\u6210\u7684 Caddyfile",
  "caddy.copyFile": "\u4E00\u952E\u590D\u5236 Caddyfile",
  "caddy.fileError": "\u751F\u6210\u5931\u8D25\uFF1A",
  "caddy.mac": "\u2463 Mac \u7EC8\u7AEF\u542F\u52A8\u547D\u4EE4",
  "caddy.win": "\u2464 Windows PowerShell \u542F\u52A8\u547D\u4EE4",
  "caddy.copyMac": "\u590D\u5236 Mac \u547D\u4EE4",
  "caddy.copyWin": "\u590D\u5236 Windows \u547D\u4EE4",
  "caddy.hashFirst": "\u8BF7\u5148\u5728\u4E0A\u65B9\u751F\u6210 bcrypt \u54C8\u5E0C",
  // Section 3 — audit
  "audit.section": "\u2695\uFE0F \u5B89\u5168\u98CE\u9669\u5BA1\u8BA1",
  "audit.desc": "\u4EE5\u4E0B\u7ED3\u8BBA\u7531\u63D2\u4EF6\u5728\u6D4F\u89C8\u5668\u5185\u57FA\u4E8E\u5BBF\u4E3B\u4FE1\u606F\u8BA1\u7B97\uFF0C\u4EC5\u4F9B\u53C2\u8003\u3002",
  "audit.listen": "\u5F53\u524D DSH \u76D1\u542C\u5730\u5740\uFF1A",
  "audit.unknown": "\u672A\u77E5\uFF08\u5BA1\u8BA1\u63A5\u53E3\u4E0D\u53EF\u7528\uFF09",
  "audit.error": "\u5BA1\u8BA1\u4FE1\u606F\u83B7\u53D6\u5931\u8D25",
  "audit.refresh": "\u91CD\u65B0\u5BA1\u8BA1",
  // Section 4 — help
  "help.section": "\u{1F4D6} \u5C0F\u767D\u4F7F\u7528\u6307\u5F15",
  "help.intro": "Caddy \u662F\u4E00\u4E2A\u81EA\u52A8 HTTPS \u7684\u53CD\u5411\u4EE3\u7406\uFF0C\u914D\u5408\u672C\u63D2\u4EF6\u751F\u6210\u7684\u914D\u7F6E\u5373\u53EF\u4E3A DSH \u63D0\u4F9B\u771F\u6B63\u7684\u63A5\u53E3\u9274\u6743\u3002",
  "help.download": "\u2460 \u4E0B\u8F7D Caddy \u4E8C\u8FDB\u5236\uFF08\u514D\u8D39\uFF09",
  "help.downloadMac": "Mac\uFF1Abrew install caddy\uFF08\u6216\u5230 GitHub Releases \u4E0B\u8F7D darwin-arm64 / darwin-amd64\uFF09",
  "help.downloadWin": "Windows\uFF1A\u5230 GitHub Releases \u4E0B\u8F7D windows-amd64\uFF0C\u89E3\u538B\u5373\u7528\uFF08\u65E0\u9700\u5B89\u88C5\uFF09",
  "help.github": "GitHub Releases\uFF1Ahttps://github.com/caddyserver/caddy/releases",
  "help.step2": "\u2461 \u751F\u6210\u54C8\u5E0C\u5E76\u586B\u5199\u53C2\u6570\uFF0C\u70B9\u51FB\u300C\u751F\u6210\u5B8C\u6574 Caddyfile\u300D\uFF0C\u628A\u8F93\u51FA\u4FDD\u5B58\u4E3A\u6587\u4EF6\uFF1A",
  "help.step2Mac": "Mac\uFF1A\u4FDD\u5B58\u5230 caddy \u6240\u5728\u76EE\u5F55\uFF0C\u6587\u4EF6\u540D Caddyfile\uFF08\u65E0\u540E\u7F00\uFF09",
  "help.step2Win": "Windows\uFF1A\u4FDD\u5B58\u4E3A Caddyfile\uFF08\u6CE8\u610F\u7CFB\u7EDF\u4E0D\u8981\u81EA\u52A8\u8FFD\u52A0 .txt \u540E\u7F00\uFF09",
  "help.step3": "\u2462 \u6253\u5F00\u7EC8\u7AEF\u8FD0\u884C\u5BF9\u5E94\u542F\u52A8\u547D\u4EE4\uFF08\u590D\u5236\u4E0A\u9762\u7684\u547D\u4EE4\uFF09",
  "help.step4": "\u2463 \u9A8C\u8BC1\uFF1A\u6D4F\u89C8\u5668\u8BBF\u95EE http://127.0.0.1:8081\uFF0C\u5E94\u5F39\u51FA\u8D26\u53F7\u5BC6\u7801\u6846",
  "help.step5": "\u2464 \u516C\u7F51\u7A7F\u900F\u65F6\uFF0Ccloudflared \u96A7\u9053\u6307\u5411 8081 \u800C\u975E 3080\uFF1A",
  "help.tunnel": "cloudflared tunnel --url http://127.0.0.1:8081",
  "help.pitfalls": "\u5E38\u89C1\u5751\uFF1A",
  "help.pitfall1": "1. Windows \u4FDD\u5B58 Caddyfile \u522B\u5E26 .txt \u540E\u7F00\uFF0C\u6587\u4EF6\u540D\u5C31\u662F Caddyfile",
  "help.pitfall2": "2. caddy / cloudflared \u5FC5\u987B\u65B0\u5F00\u72EC\u7ACB\u7EC8\u7AEF\uFF0C\u4E0D\u80FD\u5360\u7528 DSH \u8FDB\u7A0B",
  "help.pitfall3": "3. \u96A7\u9053\u76EE\u6807\u5730\u5740\u662F\u4EE3\u7406\u7AEF\u53E3 8081\uFF0C\u4E0D\u662F DSH \u539F\u59CB 3080",
  "help.pitfall4": "4. \u91CD\u542F\u7535\u8111\u540E caddy / cloudflared \u9700\u8981\u91CD\u65B0\u624B\u52A8\u542F\u52A8",
  "help.pitfall5": "5. Windows \u9632\u706B\u5899\u53EF\u80FD\u62E6\u622A 8081\uFF0C\u9700\u5141\u8BB8\u8BBF\u95EE",
  "help.risk": "\u98CE\u9669\u58F0\u660E\uFF1A\u672C\u63D2\u4EF6\u65E0\u6CD5\u62E6\u622A\u540E\u7AEF HTTP \u63A5\u53E3\uFF1B\u9875\u9762\u5BC6\u7801\u9501\uFF08\u7B49\u7EA7 1\uFF09\u53EA\u9002\u5408\u5185\u7F51\u4FE1\u4EFB\u73AF\u5883\uFF0C\u4E25\u7981\u76F4\u63A5\u516C\u7F51\u7A7F\u900F\u3002",
  // Audit findings (severity labels + fallback text lives in the audit lib)
  "audit.severity.danger": "\u9AD8\u5371",
  "audit.severity.warn": "\u8B66\u544A",
  "audit.severity.ok": "\u6B63\u5E38",
  // Overlay
  "overlay.title": "\u{1F512} DSH \u5DF2\u9501\u5B9A",
  "overlay.desc": "\u8BF7\u8F93\u5165\u9875\u9762\u8BBF\u95EE\u5BC6\u7801\u4EE5\u7EE7\u7EED",
  "overlay.placeholder": "\u9875\u9762\u8BBF\u95EE\u5BC6\u7801",
  "overlay.unlock": "\u89E3\u9501",
  "overlay.unlocking": "\u9A8C\u8BC1\u4E2D\u2026",
  "overlay.error.wrong": "\u5BC6\u7801\u9519\u8BEF",
  "overlay.error.empty": "\u8BF7\u8F93\u5165\u5BC6\u7801",
  "overlay.error.network": "\u9A8C\u8BC1\u670D\u52A1\u4E0D\u53EF\u7528\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5",
  "overlay.error.notConfigured": "\u9875\u9762\u9501\u672A\u914D\u7F6E\u5BC6\u7801\uFF1A\u8BF7\u5148\u5230\u63D2\u4EF6\u8BBE\u7F6E\u4E2D\u4FDD\u5B58\u5BC6\u7801\uFF0C\u6216\u5173\u95ED\u9875\u9762\u9501",
  "overlay.hint": "\u5B89\u5168\u7B49\u7EA7 1\uFF1A\u4EC5\u4FDD\u62A4\u7F51\u9875\uFF0CAPI/WebSocket \u672A\u53D7\u4FDD\u62A4\uFF0C\u7981\u6B62\u516C\u7F51\u7A7F\u900F",
  "overlay.hint2": "\u5FD8\u8BB0\u5BC6\u7801\uFF1F\u8BF7\u4FEE\u6539 DSH \u914D\u7F6E\uFF08\u79FB\u9664 pagePasswordHash\uFF09\u6216\u5378\u8F7D\u63D2\u4EF6\u540E\u91CD\u65B0\u914D\u7F6E",
  // Copied feedback
  // Accordion header badges
  "badge.lockOn": "\u9875\u9762\u9501\u5DF2\u542F\u7528",
  "badge.lockOff": "\u9875\u9762\u9501\u672A\u542F\u7528",
  "badge.hashReady": "\u54C8\u5E0C\u5DF2\u751F\u6210",
  "badge.hashPending": "\u5F85\u751F\u6210\u54C8\u5E0C",
  "badge.auditSafe": "\u5BA1\u8BA1\u6B63\u5E38",
  "badge.auditDanger": "{n} \u9879\u9AD8\u5371",
  "badge.auditUnknown": "\u5F85\u5BA1\u8BA1",
  "copied": "\u5DF2\u590D\u5236"
};
var en = {
  "card.title": "DSH Remote Access Auth",
  "card.subtitle": "Page lock + Caddy reverse-proxy config generator (pure text output \u2014 the plugin never writes files or starts programs)",
  "lock.section": "\u{1F510} Page Access Password (Level 1 \xB7 LAN mode)",
  "lock.warning": "\u26A0\uFE0F This mode protects the web page ONLY \u2014 /api and /ws endpoints stay exposed. Never tunnel to the public internet; LAN trusted environments only.",
  "lock.status.on": "Page lock: ENABLED",
  "lock.status.off": "Page lock: disabled",
  "lock.status.hash": "Password hash: configured",
  "lock.status.nohash": "Password hash: not configured",
  "lock.setPassword": "Set page password",
  "lock.passwordPlaceholder": "Page access password (min 4 chars)",
  "lock.save": "Save password",
  "lock.saving": "Saving\u2026",
  "lock.saved": "\u2713 Saved and page lock enabled (takes effect after reload)",
  "lock.clearToken": "Clear local auth token (for testing)",
  "lock.error.empty": "Password must not be empty",
  "lock.error.tooShort": "Password must be at least 4 characters",
  "lock.error.writeFailed": "Save failed: settings write refused",
  "lock.disable": "Disable page lock",
  "lock.disableHint": "When disabled anyone can open the page without a password (you can re-enable anytime)",
  "caddy.section": "\u{1F6E1}\uFE0F Public Security (Level 2 \xB7 needs Caddy reverse proxy, recommended for the internet)",
  "caddy.warning": "\u26A0\uFE0F This plugin never downloads or runs Caddy. Everything below is text \u2014 copy it and act manually.",
  "caddy.hashTitle": "\u2460 Generate a BCrypt password hash (computed locally in your browser; the plaintext never leaves this machine)",
  "caddy.hashPassword": "Proxy access password",
  "caddy.hashRounds": "Rounds",
  "caddy.generateHash": "Generate bcrypt hash",
  "caddy.hashResult": "Generated hash (paste into the Caddyfile below)",
  "caddy.copyHash": "Copy hash",
  "caddy.paramsTitle": "\u2461 Caddy parameters",
  "caddy.port": "Proxy listen port (default 8081, do not use 3080)",
  "caddy.backend": "DSH backend URL (default http://127.0.0.1:3080)",
  "caddy.user": "Username (default dshuser)",
  "caddy.generateFile": "Generate full Caddyfile",
  "caddy.fileTitle": "\u2462 Generated Caddyfile",
  "caddy.copyFile": "Copy Caddyfile",
  "caddy.fileError": "Generation failed: ",
  "caddy.mac": "\u2463 macOS terminal command",
  "caddy.win": "\u2464 Windows PowerShell command",
  "caddy.copyMac": "Copy macOS command",
  "caddy.copyWin": "Copy Windows command",
  "caddy.hashFirst": "Generate a bcrypt hash above first",
  "audit.section": "\u2695\uFE0F Security Risk Audit",
  "audit.desc": "Conclusions below are computed in your browser from host facts \u2014 advisory only.",
  "audit.listen": "DSH currently listens on: ",
  "audit.unknown": "unknown (audit endpoint unavailable)",
  "audit.error": "Failed to fetch audit info",
  "audit.refresh": "Re-audit",
  "help.section": "\u{1F4D6} Beginner Guide",
  "help.intro": "Caddy is a reverse proxy with automatic HTTPS. Combined with the config this plugin generates, it provides real API-level authentication for DSH.",
  "help.download": "\u2460 Download the Caddy binary (free)",
  "help.downloadMac": "macOS: brew install caddy (or grab darwin-arm64 / darwin-amd64 from GitHub Releases)",
  "help.downloadWin": "Windows: grab windows-amd64 from GitHub Releases, extract and run (no install)",
  "help.github": "GitHub Releases: https://github.com/caddyserver/caddy/releases",
  "help.step2": "\u2461 Generate a hash, fill the parameters, click \u201CGenerate full Caddyfile\u201D, save the output as a file:",
  "help.step2Mac": "macOS: save next to the caddy binary, file name Caddyfile (no extension)",
  "help.step2Win": "Windows: save as Caddyfile (make sure the system does not append .txt)",
  "help.step3": "\u2462 Open a terminal and run the matching command (copied above)",
  "help.step4": "\u2463 Verify: open http://127.0.0.1:8081 \u2014 a username/password prompt should appear",
  "help.step5": "\u2464 For public tunneling, point cloudflared at 8081, not 3080:",
  "help.tunnel": "cloudflared tunnel --url http://127.0.0.1:8081",
  "help.pitfalls": "Common pitfalls:",
  "help.pitfall1": "1. On Windows save the file as Caddyfile, never Caddyfile.txt",
  "help.pitfall2": "2. Run caddy / cloudflared in a separate terminal \u2014 never inside the DSH process",
  "help.pitfall3": "3. The tunnel target is the proxy port 8081, not DSH\u2019s original 3080",
  "help.pitfall4": "4. After a reboot you must restart caddy / cloudflared manually",
  "help.pitfall5": "5. Windows Firewall may block 8081 \u2014 allow it",
  "help.risk": "Risk statement: this plugin cannot intercept backend HTTP endpoints; the page lock (level 1) is only for trusted LAN environments \u2014 never expose it directly to the public internet.",
  "audit.severity.danger": "HIGH RISK",
  "audit.severity.warn": "WARNING",
  "audit.severity.ok": "OK",
  "overlay.title": "\u{1F512} DSH is locked",
  "overlay.desc": "Enter the page access password to continue",
  "overlay.placeholder": "Page access password",
  "overlay.unlock": "Unlock",
  "overlay.unlocking": "Verifying\u2026",
  "overlay.error.wrong": "Wrong password",
  "overlay.error.empty": "Enter the password",
  "overlay.error.network": "Verification service unavailable, try again later",
  "overlay.error.notConfigured": "Page lock has no password configured: save one in the plugin settings, or disable the lock",
  "overlay.hint": "Level 1: protects the page only \u2014 API/WebSocket stay exposed, no public tunneling",
  "overlay.hint2": "Forgot the password? Edit the DSH config (remove pagePasswordHash) or uninstall the plugin to reconfigure",
  // Accordion header badges
  "badge.lockOn": "Lock enabled",
  "badge.lockOff": "Lock off",
  "badge.hashReady": "Hash ready",
  "badge.hashPending": "No hash yet",
  "badge.auditSafe": "Audit OK",
  "badge.auditDanger": "{n} high-risk",
  "badge.auditUnknown": "Not audited",
  "copied": "Copied"
};
var dicts = { zh, en };
function resolveLang(pref) {
  if (pref === "zh" || pref === "en") return pref;
  let code = "";
  try {
    code = String(navigator?.language ?? "");
  } catch {
  }
  return /^zh/i.test(code) ? "zh" : "en";
}
function translate(lang2, key, params) {
  const table = dicts[lang2] ?? en;
  let text = table[key] ?? en[key] ?? key;
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      text = text.split(`{${name}}`).join(String(value));
    }
  }
  return text;
}

// src/client/card.tsx
import { jsx, jsxs } from "react/jsx-runtime";
var lang = resolveLang(void 0);
var t = (key, params) => translate(lang, key, params);
var severityClass = {
  danger: "dra-danger",
  warn: "dra-warn",
  ok: "dra-ok"
};
function RemoteAccessCard(props) {
  const state = props.useRemoteAccess((snapshot) => snapshot);
  const copied = state.copied;
  const [openSection, setOpenSection] = useState("lock");
  const toggleSection = (section) => {
    setOpenSection((prev) => prev === section ? null : section);
  };
  const [openStep, setOpenStep] = useState("hash");
  const toggleStep = (step) => {
    setOpenStep((prev) => prev === step ? null : step);
  };
  const runGenerateHash = async () => {
    const result = await props.generateHash(state.hashGenPassword, state.hashGenRounds);
    if (result.ok) setOpenStep("params");
  };
  const runGenerateCaddyfile = () => {
    const result = props.generateCaddyfile();
    if (result.ok) setOpenStep("output");
  };
  const lockBadge = state.pageLockEnabled ? { text: t("badge.lockOn"), cls: "dra-ok" } : { text: t("badge.lockOff"), cls: "dra-muted" };
  const hashReady = state.hashGenResult !== "";
  const caddyReady = state.caddyOutput !== "";
  const caddyBadge = hashReady ? { text: t("badge.hashReady"), cls: "dra-ok" } : { text: t("badge.hashPending"), cls: "dra-warn" };
  const dangerCount = state.auditFindings.filter((f) => f.severity === "danger").length;
  const auditBadge = state.auditError !== "" ? { text: t("badge.auditUnknown"), cls: "dra-warn" } : dangerCount > 0 ? { text: t("badge.auditDanger", { n: dangerCount }), cls: "dra-danger" } : state.auditFindings.length > 0 ? { text: t("badge.auditSafe"), cls: "dra-ok" } : { text: t("badge.auditUnknown"), cls: "dra-muted" };
  return /* @__PURE__ */ jsxs("div", { className: "dra-card", children: [
    /* @__PURE__ */ jsxs("div", { className: "dra-card-head", children: [
      /* @__PURE__ */ jsx("h4", { children: t("card.title") }),
      /* @__PURE__ */ jsx("div", { className: "dra-muted", children: t("card.subtitle") })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "dra-accordion", children: [
      /* @__PURE__ */ jsxs("div", { className: "dra-acc-item", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            className: "dra-acc-header",
            "aria-expanded": openSection === "lock",
            onClick: () => toggleSection("lock"),
            children: [
              /* @__PURE__ */ jsx("span", { className: "dra-acc-caret", children: openSection === "lock" ? "\u25BE" : "\u25B8" }),
              /* @__PURE__ */ jsx("span", { className: "dra-acc-title", children: t("lock.section") }),
              /* @__PURE__ */ jsx("span", { className: `dra-acc-badge ${lockBadge.cls}`, children: lockBadge.text })
            ]
          }
        ),
        openSection === "lock" && /* @__PURE__ */ jsxs("div", { className: "dra-acc-body", children: [
          /* @__PURE__ */ jsx("div", { className: "dra-banner-danger", children: t("lock.warning") }),
          /* @__PURE__ */ jsx("div", { className: "dra-row", children: /* @__PURE__ */ jsxs("span", { className: "dra-status", children: [
            state.pageLockEnabled ? t("lock.status.on") : t("lock.status.off"),
            " \xB7 ",
            state.hashConfigured ? t("lock.status.hash") : t("lock.status.nohash")
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "dra-row", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                className: "dra-input",
                type: "password",
                placeholder: t("lock.passwordPlaceholder"),
                value: state.pagePassword,
                onChange: (e) => props.setField("pagePassword", e.target.value)
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                className: "dra-btn dra-btn-primary",
                disabled: state.savingPassword || state.pagePassword.length === 0,
                onClick: () => {
                  void props.savePagePassword(state.pagePassword);
                },
                children: state.savingPassword ? t("lock.saving") : t("lock.save")
              }
            )
          ] }),
          state.passwordSaved && /* @__PURE__ */ jsx("div", { className: "dra-ok", children: t("lock.saved") }),
          state.passwordError === "empty" && /* @__PURE__ */ jsx("div", { className: "dra-danger", children: t("lock.error.empty") }),
          state.passwordError === "too-short" && /* @__PURE__ */ jsx("div", { className: "dra-danger", children: t("lock.error.tooShort") }),
          state.passwordError === "write-failed" && /* @__PURE__ */ jsx("div", { className: "dra-danger", children: t("lock.error.writeFailed") }),
          /* @__PURE__ */ jsxs("div", { className: "dra-row", children: [
            /* @__PURE__ */ jsx("button", { className: "dra-btn", onClick: () => props.clearLocalToken(), children: t("lock.clearToken") }),
            state.pageLockEnabled && /* @__PURE__ */ jsx("button", { className: "dra-btn", onClick: () => {
              void props.disablePageLock();
            }, children: t("lock.disable") })
          ] }),
          state.pageLockEnabled && /* @__PURE__ */ jsx("div", { className: "dra-muted", children: t("lock.disableHint") })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "dra-acc-item", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            className: "dra-acc-header",
            "aria-expanded": openSection === "caddy",
            onClick: () => toggleSection("caddy"),
            children: [
              /* @__PURE__ */ jsx("span", { className: "dra-acc-caret", children: openSection === "caddy" ? "\u25BE" : "\u25B8" }),
              /* @__PURE__ */ jsx("span", { className: "dra-acc-title", children: t("caddy.section") }),
              /* @__PURE__ */ jsx("span", { className: `dra-acc-badge ${caddyBadge.cls}`, children: caddyBadge.text })
            ]
          }
        ),
        openSection === "caddy" && /* @__PURE__ */ jsxs("div", { className: "dra-acc-body", children: [
          /* @__PURE__ */ jsx("div", { className: "dra-banner-info", children: t("caddy.warning") }),
          /* @__PURE__ */ jsxs("div", { className: "dra-accordion dra-accordion-inner", children: [
            /* @__PURE__ */ jsxs("div", { className: "dra-acc-item dra-step-item", children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  className: "dra-acc-header",
                  "aria-expanded": openStep === "hash",
                  onClick: () => toggleStep("hash"),
                  children: [
                    /* @__PURE__ */ jsx("span", { className: "dra-acc-caret", children: openStep === "hash" ? "\u25BE" : "\u25B8" }),
                    /* @__PURE__ */ jsx("span", { className: "dra-step-num", children: "\u2460" }),
                    /* @__PURE__ */ jsx("span", { className: "dra-acc-title", children: t("caddy.hashTitle") }),
                    hashReady && /* @__PURE__ */ jsx("span", { className: "dra-acc-badge dra-ok", children: "\u2713" })
                  ]
                }
              ),
              openStep === "hash" && /* @__PURE__ */ jsxs("div", { className: "dra-acc-body", children: [
                /* @__PURE__ */ jsxs("div", { className: "dra-row", children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      className: "dra-input",
                      type: "password",
                      placeholder: t("caddy.hashPassword"),
                      value: state.hashGenPassword,
                      onChange: (e) => props.setField("hashGenPassword", e.target.value)
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      className: "dra-input",
                      type: "number",
                      style: { flex: "0 0 80px" },
                      min: 4,
                      max: 31,
                      value: state.hashGenRounds,
                      onChange: (e) => props.setField("hashGenRounds", Number(e.target.value))
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      className: "dra-btn",
                      disabled: state.hashGenPassword.length === 0,
                      onClick: () => {
                        void runGenerateHash();
                      },
                      children: t("caddy.generateHash")
                    }
                  )
                ] }),
                state.hashGenError === "empty" && /* @__PURE__ */ jsx("div", { className: "dra-danger", children: t("lock.error.empty") }),
                state.hashGenError === "gen-failed" && /* @__PURE__ */ jsx("div", { className: "dra-danger", children: t("caddy.fileError") }),
                state.hashGenResult !== "" && /* @__PURE__ */ jsx("div", { className: "dra-row", children: /* @__PURE__ */ jsx("textarea", { className: "dra-textarea", readOnly: true, value: state.hashGenResult }) }),
                /* @__PURE__ */ jsxs("div", { className: "dra-row", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      className: "dra-btn",
                      disabled: state.hashGenResult === "",
                      onClick: () => {
                        void props.copyText(state.hashGenResult, "hash");
                      },
                      children: t("caddy.copyHash")
                    }
                  ),
                  copied === "hash" && /* @__PURE__ */ jsx("span", { className: "dra-copied", children: t("copied") })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "dra-acc-item dra-step-item", children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  className: "dra-acc-header",
                  "aria-expanded": openStep === "params",
                  onClick: () => toggleStep("params"),
                  children: [
                    /* @__PURE__ */ jsx("span", { className: "dra-acc-caret", children: openStep === "params" ? "\u25BE" : "\u25B8" }),
                    /* @__PURE__ */ jsx("span", { className: "dra-step-num", children: "\u2461" }),
                    /* @__PURE__ */ jsx("span", { className: "dra-acc-title", children: t("caddy.paramsTitle") }),
                    caddyReady && /* @__PURE__ */ jsx("span", { className: "dra-acc-badge dra-ok", children: "\u2713" })
                  ]
                }
              ),
              openStep === "params" && /* @__PURE__ */ jsxs("div", { className: "dra-acc-body", children: [
                /* @__PURE__ */ jsx("div", { className: "dra-row", children: /* @__PURE__ */ jsx(
                  "input",
                  {
                    className: "dra-input",
                    placeholder: t("caddy.port"),
                    value: state.caddyPortInput,
                    onChange: (e) => props.setField("caddyPortInput", e.target.value)
                  }
                ) }),
                /* @__PURE__ */ jsx("div", { className: "dra-row", children: /* @__PURE__ */ jsx(
                  "input",
                  {
                    className: "dra-input",
                    placeholder: t("caddy.backend"),
                    value: state.caddyBackendInput,
                    onChange: (e) => props.setField("caddyBackendInput", e.target.value)
                  }
                ) }),
                /* @__PURE__ */ jsx("div", { className: "dra-row", children: /* @__PURE__ */ jsx(
                  "input",
                  {
                    className: "dra-input",
                    placeholder: t("caddy.user"),
                    value: state.caddyUserInput,
                    onChange: (e) => props.setField("caddyUserInput", e.target.value)
                  }
                ) }),
                /* @__PURE__ */ jsxs("div", { className: "dra-row", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      className: "dra-btn dra-btn-primary",
                      disabled: state.hashGenResult === "",
                      onClick: () => runGenerateCaddyfile(),
                      children: t("caddy.generateFile")
                    }
                  ),
                  state.hashGenResult === "" && /* @__PURE__ */ jsx("span", { className: "dra-muted", children: t("caddy.hashFirst") })
                ] }),
                state.caddyError !== "" && /* @__PURE__ */ jsxs("div", { className: "dra-danger", children: [
                  t("caddy.fileError"),
                  state.caddyError
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "dra-acc-item dra-step-item", children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  className: "dra-acc-header",
                  "aria-expanded": openStep === "output",
                  onClick: () => toggleStep("output"),
                  children: [
                    /* @__PURE__ */ jsx("span", { className: "dra-acc-caret", children: openStep === "output" ? "\u25BE" : "\u25B8" }),
                    /* @__PURE__ */ jsx("span", { className: "dra-step-num", children: "\u2462" }),
                    /* @__PURE__ */ jsx("span", { className: "dra-acc-title", children: t("caddy.fileTitle") })
                  ]
                }
              ),
              openStep === "output" && /* @__PURE__ */ jsxs("div", { className: "dra-acc-body", children: [
                state.caddyOutput !== "" && /* @__PURE__ */ jsx("div", { className: "dra-row", children: /* @__PURE__ */ jsx("textarea", { className: "dra-textarea", readOnly: true, value: state.caddyOutput }) }),
                /* @__PURE__ */ jsxs("div", { className: "dra-row", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      className: "dra-btn",
                      disabled: state.caddyOutput === "",
                      onClick: () => {
                        void props.copyText(state.caddyOutput, "caddy");
                      },
                      children: t("caddy.copyFile")
                    }
                  ),
                  copied === "caddy" && /* @__PURE__ */ jsx("span", { className: "dra-copied", children: t("copied") })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "dra-step-divider" }),
                /* @__PURE__ */ jsx("div", { className: "dra-muted", children: t("caddy.mac") }),
                /* @__PURE__ */ jsx("textarea", { className: "dra-textarea", readOnly: true, value: props.macCommand() }),
                /* @__PURE__ */ jsxs("div", { className: "dra-row", children: [
                  /* @__PURE__ */ jsx("button", { className: "dra-btn", onClick: () => {
                    void props.copyText(props.macCommand(), "mac");
                  }, children: t("caddy.copyMac") }),
                  copied === "mac" && /* @__PURE__ */ jsx("span", { className: "dra-copied", children: t("copied") })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "dra-step-divider" }),
                /* @__PURE__ */ jsx("div", { className: "dra-muted", children: t("caddy.win") }),
                /* @__PURE__ */ jsx("textarea", { className: "dra-textarea", readOnly: true, value: props.winCommand() }),
                /* @__PURE__ */ jsxs("div", { className: "dra-row", children: [
                  /* @__PURE__ */ jsx("button", { className: "dra-btn", onClick: () => {
                    void props.copyText(props.winCommand(), "win");
                  }, children: t("caddy.copyWin") }),
                  copied === "win" && /* @__PURE__ */ jsx("span", { className: "dra-copied", children: t("copied") })
                ] })
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "dra-acc-item", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            className: "dra-acc-header",
            "aria-expanded": openSection === "audit",
            onClick: () => toggleSection("audit"),
            children: [
              /* @__PURE__ */ jsx("span", { className: "dra-acc-caret", children: openSection === "audit" ? "\u25BE" : "\u25B8" }),
              /* @__PURE__ */ jsx("span", { className: "dra-acc-title", children: t("audit.section") }),
              /* @__PURE__ */ jsx("span", { className: `dra-acc-badge ${auditBadge.cls}`, children: auditBadge.text })
            ]
          }
        ),
        openSection === "audit" && /* @__PURE__ */ jsxs("div", { className: "dra-acc-body", children: [
          /* @__PURE__ */ jsx("div", { className: "dra-muted", children: t("audit.desc") }),
          /* @__PURE__ */ jsx("div", { className: "dra-row", children: /* @__PURE__ */ jsx("button", { className: "dra-btn", onClick: () => {
            void props.refreshAudit();
          }, children: t("audit.refresh") }) }),
          state.auditError !== "" && /* @__PURE__ */ jsx("div", { className: "dra-danger", children: t("audit.error") }),
          state.auditFindings.map((finding, index) => /* @__PURE__ */ jsxs("div", { className: `dra-row ${severityClass[finding.severity] ?? "dra-muted"}`, children: [
            /* @__PURE__ */ jsxs("strong", { children: [
              "[",
              t(`audit.severity.${finding.severity}`),
              "]"
            ] }),
            /* @__PURE__ */ jsx("span", { children: t(finding.key, finding.key === "audit.envHint" ? {} : void 0) })
          ] }, `${finding.key}-${index}`))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "dra-acc-item", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            className: "dra-acc-header",
            "aria-expanded": openSection === "help",
            onClick: () => toggleSection("help"),
            children: [
              /* @__PURE__ */ jsx("span", { className: "dra-acc-caret", children: openSection === "help" ? "\u25BE" : "\u25B8" }),
              /* @__PURE__ */ jsx("span", { className: "dra-acc-title", children: t("help.section") })
            ]
          }
        ),
        openSection === "help" && /* @__PURE__ */ jsxs("div", { className: "dra-acc-body", children: [
          /* @__PURE__ */ jsx("div", { className: "dra-muted", children: t("help.intro") }),
          /* @__PURE__ */ jsx("div", { children: t("help.download") }),
          /* @__PURE__ */ jsxs("ul", { children: [
            /* @__PURE__ */ jsx("li", { children: t("help.downloadMac") }),
            /* @__PURE__ */ jsx("li", { children: t("help.downloadWin") })
          ] }),
          /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("a", { href: "https://github.com/caddyserver/caddy/releases", target: "_blank", rel: "noreferrer", children: t("help.github") }) }),
          /* @__PURE__ */ jsx("div", { children: t("help.step2") }),
          /* @__PURE__ */ jsxs("ul", { children: [
            /* @__PURE__ */ jsx("li", { children: t("help.step2Mac") }),
            /* @__PURE__ */ jsx("li", { children: t("help.step2Win") })
          ] }),
          /* @__PURE__ */ jsx("div", { children: t("help.step3") }),
          /* @__PURE__ */ jsx("div", { children: t("help.step4") }),
          /* @__PURE__ */ jsx("div", { children: t("help.step5") }),
          /* @__PURE__ */ jsx("code", { children: t("help.tunnel") }),
          /* @__PURE__ */ jsx("div", { children: t("help.pitfalls") }),
          /* @__PURE__ */ jsxs("ul", { children: [
            /* @__PURE__ */ jsx("li", { children: t("help.pitfall1") }),
            /* @__PURE__ */ jsx("li", { children: t("help.pitfall2") }),
            /* @__PURE__ */ jsx("li", { children: t("help.pitfall3") }),
            /* @__PURE__ */ jsx("li", { children: t("help.pitfall4") }),
            /* @__PURE__ */ jsx("li", { children: t("help.pitfall5") })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "dra-banner-danger", children: t("help.risk") })
        ] })
      ] })
    ] })
  ] });
}
export {
  RemoteAccessCard
};
