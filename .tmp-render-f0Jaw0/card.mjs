// src/client/card.tsx
import { useState } from "react";

// src/client/locales.ts
var zh = {
  // Card outer shell (websearch-style collapsible card)
  "card.title": "DSH \u8FDC\u7A0B\u8BBF\u95EE\u9274\u6743",
  "card.subtitle": "\u9875\u9762\u5BC6\u7801\u9501 + Caddy \u53CD\u5411\u4EE3\u7406\u914D\u7F6E\u751F\u6210\uFF08\u7EAF\u5B57\u7B26\u4E32\u8F93\u51FA\uFF0C\u63D2\u4EF6\u4E0D\u5199\u6587\u4EF6\u3001\u4E0D\u542F\u52A8\u7A0B\u5E8F\uFF09",
  // Section 1 — page lock
  "lock.section": "\u9875\u9762\u8BBF\u95EE\u5BC6\u7801\uFF08\u5B89\u5168\u7B49\u7EA7 1 \xB7 \u5185\u7F51\u6A21\u5F0F\uFF09",
  "lock.warning": "\u8B66\u544A\uFF1A\u8BE5\u6A21\u5F0F\u4EC5\u4FDD\u62A4\u7F51\u9875\uFF0C/api \u4E0E /ws \u63A5\u53E3\u4ECD\u7136\u88F8\u9732\uFF0C\u7981\u6B62\u516C\u7F51\u7A7F\u900F\uFF0C\u4EC5\u9650\u5185\u7F51\u53EF\u4FE1\u73AF\u5883\u4F7F\u7528\u3002",
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
  "caddy.section": "\u516C\u7F51\u5B89\u5168\u914D\u7F6E\uFF08\u5B89\u5168\u7B49\u7EA7 2 \xB7 \u9700\u8981 Caddy \u53CD\u5411\u4EE3\u7406\uFF09",
  "caddy.warning": "\u91CD\u8981\uFF1A\u672C\u63D2\u4EF6\u4E0D\u4F1A\u81EA\u52A8\u4E0B\u8F7D\u6216\u8FD0\u884C Caddy\uFF0C\u4EE5\u4E0B\u5185\u5BB9\u5747\u4E3A\u6587\u672C\uFF0C\u590D\u5236\u540E\u9700\u624B\u52A8\u64CD\u4F5C\u3002",
  "caddy.hashTitle": "\u6B65\u9AA4 1 \xB7 \u751F\u6210 BCrypt \u5BC6\u7801\u54C8\u5E0C\uFF08\u6D4F\u89C8\u5668\u672C\u5730\u8BA1\u7B97\uFF0C\u660E\u6587\u4E0D\u51FA\u672C\u673A\uFF09",
  "caddy.hashPassword": "\u4EE3\u7406\u8BBF\u95EE\u5BC6\u7801",
  "caddy.hashRounds": "\u8F6E\u6570",
  "caddy.generateHash": "\u751F\u6210 bcrypt \u54C8\u5E0C",
  "caddy.hashResult": "\u751F\u6210\u7684\u54C8\u5E0C\uFF08\u7C98\u8D34\u5230 Caddyfile / \u4E0A\u4E00\u6B65\uFF09",
  "caddy.copyHash": "\u590D\u5236\u54C8\u5E0C",
  "caddy.paramsTitle": "\u6B65\u9AA4 2 \xB7 Caddy \u914D\u7F6E\u53C2\u6570",
  "caddy.port": "\u4EE3\u7406\u76D1\u542C\u7AEF\u53E3\uFF08\u9ED8\u8BA4 8081\uFF0C\u4E0D\u8981\u7528 3080\uFF09",
  "caddy.backend": "DSH \u540E\u7AEF\u5730\u5740\uFF08\u9ED8\u8BA4 http://127.0.0.1:3080\uFF09",
  "caddy.user": "\u8D26\u53F7\uFF08\u9ED8\u8BA4 dshuser\uFF09",
  "caddy.generateFile": "\u751F\u6210\u5B8C\u6574 Caddyfile",
  "caddy.fileTitle": "\u6B65\u9AA4 3 \xB7 \u751F\u6210\u7684 Caddyfile \u4E0E\u542F\u52A8\u547D\u4EE4",
  "caddy.copyFile": "\u4E00\u952E\u590D\u5236 Caddyfile",
  "caddy.fileError": "\u751F\u6210\u5931\u8D25\uFF1A",
  "caddy.mac": "4. Mac \u7EC8\u7AEF\u542F\u52A8\u547D\u4EE4",
  "caddy.win": "\u2464 Windows PowerShell \u542F\u52A8\u547D\u4EE4",
  "caddy.copyMac": "\u590D\u5236 Mac \u547D\u4EE4",
  "caddy.copyWin": "\u590D\u5236 Windows \u547D\u4EE4",
  "caddy.hashFirst": "\u8BF7\u5148\u5728\u4E0A\u65B9\u751F\u6210 bcrypt \u54C8\u5E0C",
  // Section 3 — audit
  "audit.section": "\u5B89\u5168\u98CE\u9669\u5BA1\u8BA1",
  "audit.desc": "\u4EE5\u4E0B\u7ED3\u8BBA\u7531\u63D2\u4EF6\u5728\u6D4F\u89C8\u5668\u5185\u57FA\u4E8E\u5BBF\u4E3B\u4FE1\u606F\u8BA1\u7B97\uFF0C\u4EC5\u4F9B\u53C2\u8003\u3002",
  "audit.listen": "\u5F53\u524D DSH \u76D1\u542C\u5730\u5740\uFF1A",
  "audit.unknown": "\u672A\u77E5\uFF08\u5BA1\u8BA1\u63A5\u53E3\u4E0D\u53EF\u7528\uFF09",
  "audit.error": "\u5BA1\u8BA1\u4FE1\u606F\u83B7\u53D6\u5931\u8D25",
  "audit.refresh": "\u91CD\u65B0\u5BA1\u8BA1",
  // Section 4 — help (end-to-end flow: remote access from a mobile device)
  "help.section": "\u4F7F\u7528\u6307\u5F15",
  "help.intro": "\u4E0B\u9762\u662F\u4E00\u5957\u80FD\u5B9E\u9645\u8D70\u901A\u7684\u5B8C\u6574\u6D41\u7A0B\uFF1A\u8BA9\u624B\u673A\u7B49\u79FB\u52A8\u8BBE\u5907\u5728\u975E\u5C40\u57DF\u7F51\uFF084G/5G/\u5F02\u5730 WiFi\uFF09\u4E0B\uFF0C\u5B89\u5168\u5730\u8FDC\u7A0B\u8BBF\u95EE\u8FD9\u53F0\u7535\u8111\u4E0A\u7684 DSH WebUI\u3002\u6BCF\u4E00\u6B65\u90FD\u914D\u6709\u53EF\u590D\u5236\u7684\u547D\u4EE4\u548C\u300C\u9884\u671F\u7ED3\u679C\u300D\uFF0C\u7167\u7740\u505A\u5373\u53EF\u3002",
  "help.mode.intro": "\u6D41\u7A0B\u76EE\u6807",
  "help.mode.inner": "\u672C\u673A\uFF1ADSH \u8FD0\u884C\u5728 127.0.0.1:3080\uFF0C\u53EA\u6709\u672C\u673A\u81EA\u5DF1\u80FD\u8BBF\u95EE",
  "help.mode.caddy": "\u7B2C 1 \u5C42\uFF08Caddy\uFF09\uFF1A\u628A 3080 \u5305\u4E00\u5C42\u300C\u8D26\u53F7\u5BC6\u7801\u300D\u53CD\u5411\u4EE3\u7406\uFF0C\u76D1\u542C 8081",
  "help.mode.tunnel": "\u7B2C 2 \u5C42\uFF08cloudflared\uFF09\uFF1A\u628A 8081 \u901A\u8FC7\u514D\u8D39\u7684 https \u5730\u5740\u6620\u5C04\u5230\u516C\u7F51",
  "help.mode.result": "\u6700\u7EC8\uFF1A\u624B\u673A\u6253\u5F00\u751F\u6210\u7684 https \u94FE\u63A5 \u2192 \u8F93\u5165\u8D26\u53F7\u5BC6\u7801 \u2192 \u8FDB\u5165\u4F60\u7684 DSH",
  "help.phase0": "\u51C6\u5907\uFF1A\u786E\u8BA4\u672C\u673A\u72B6\u6001",
  "help.p0a": "1. DS-H WebUI \u6B63\u5728\u8FD0\u884C\uFF0C\u4F60\u80FD\u5728\u6D4F\u89C8\u5668\u6253\u5F00 http://127.0.0.1:3080",
  "help.p0b": "2. \u4E0B\u9762\u4E24\u4E2A\u547D\u4EE4\u90FD\u662F\u300C\u524D\u53F0\u8FD0\u884C\u300D\uFF0C\u8BF7\u5404\u81EA\u5F00\u4E00\u4E2A\u72EC\u7ACB\u7EC8\u7AEF\u7A97\u53E3\uFF08\u4E0D\u8981\u5360\u7528 DSH \u7684\u7EC8\u7AEF\uFF0C\u5173\u6389\u5B83\u4EEC\u4F1A\u505C\u6B62\u670D\u52A1\uFF09",
  "help.p0c": "3. cloudflared \u4E3A\u514D\u8D39\u5DE5\u5177\uFF0C\u65E0\u9700\u6CE8\u518C\u8D26\u53F7\u5373\u53EF\u4E34\u65F6\u7A7F\u900F\uFF1B\u91CD\u542F\u7535\u8111\u540E\u9700\u91CD\u65B0\u624B\u52A8\u5F00\u542F",
  "help.phase1": "\u7B2C 1 \u6B65 \xB7 \u5B89\u88C5 Caddy \u4E0E cloudflared",
  "help.installMac": "Mac \u5B89\u88C5\uFF08\u7528 Homebrew\uFF0C\u4E00\u6761\u547D\u4EE4\u5404\u88C5\u4E00\u4E2A\uFF09\uFF1A",
  "help.installMacCmd": "brew install caddy cloudflared",
  "help.installWin": "Windows \u5B89\u88C5\uFF08\u5230 GitHub Releases \u4E0B\u8F7D\u89E3\u538B\uFF0C\u653E\u8FDB\u540C\u4E00\u4E2A\u6587\u4EF6\u5939\uFF09\uFF1A",
  "help.installWin1": "\u2022 Caddy\uFF1Ahttps://github.com/caddyserver/caddy/releases \u9009 windows-amd64",
  "help.installWin2": "\u2022 cloudflared\uFF1Ahttps://github.com/cloudflare/cloudflared/releases \u9009 windows-amd64.exe\uFF0C\u91CD\u547D\u540D\u4E3A cloudflared.exe",
  "help.verifyInstall": "\u9884\u671F\u7ED3\u679C\uFF1A\u7EC8\u7AEF\u6267\u884C caddy version \u4E0E cloudflared --version \u90FD\u80FD\u6253\u5370\u7248\u672C\u53F7",
  "help.phase2": "\u7B2C 2 \u6B65 \xB7 \u5728\u63D2\u4EF6\u91CC\u751F\u6210 Caddyfile \u914D\u7F6E",
  "help.step2a": "1. \u56DE\u5230\u300C\u516C\u7F51\u5B89\u5168\u914D\u7F6E\u300D\u6A21\u5757",
  "help.step2b": "2. \u5728\u300C\u6B65\u9AA4 1\u300D\u8F93\u5165\u4F60\u7684\u4EE3\u7406\u8BBF\u95EE\u5BC6\u7801\uFF0C\u70B9\u300C\u751F\u6210 bcrypt \u54C8\u5E0C\u300D\uFF0C\u590D\u5236\u751F\u6210\u7684\u54C8\u5E0C",
  "help.step2c": "3. \u5728\u300C\u6B65\u9AA4 2\u300D\u586B\u53C2\u6570\uFF1A\u4EE3\u7406\u7AEF\u53E3\u7528\u9ED8\u8BA4 8081\u3001DSH \u540E\u7AEF\u7528\u9ED8\u8BA4 http://127.0.0.1:3080\u3001\u8D26\u53F7\u7528\u9ED8\u8BA4 dshuser\uFF0C\u628A\u4E0A\u4E00\u6B65\u7684\u54C8\u5E0C\u586B\u8FDB\u53BB",
  "help.step2d": "4. \u70B9\u300C\u751F\u6210\u5B8C\u6574 Caddyfile\u300D\uFF0C\u4ECE\u300C\u6B65\u9AA4 3\u300D\u590D\u5236\u6574\u6BB5 Caddyfile \u6587\u672C",
  "help.phase3": "\u7B2C 3 \u6B65 \xB7 \u4FDD\u5B58 Caddyfile \u5E76\u542F\u52A8 Caddy",
  "help.saveMac": "Mac \u4FDD\u5B58\uFF08\u5728 Caddy \u6240\u5728\u76EE\u5F55\u65B0\u5EFA\u6587\u4EF6\uFF09",
  "help.saveMacCmd": 'cat > Caddyfile <<"EOF"\n\uFF08\u628A\u4E0A\u9762\u590D\u5236\u7684 Caddyfile \u7C98\u8D34\u5230\u8FD9\u91CC\uFF09\nEOF',
  "help.saveWin": "Windows \u4FDD\u5B58\uFF1A\u65B0\u5EFA\u6587\u672C\u6587\u4EF6\uFF0C\u7C98\u8D34\u540E\u53E6\u5B58\u4E3A Caddyfile\uFF08\u6CE8\u610F\uFF1A\u6587\u4EF6\u7C7B\u578B\u9009\u300C\u6240\u6709\u6587\u4EF6\u300D\uFF0C\u5173\u95ED\u6269\u5C55\u540D\u81EA\u52A8\u8FFD\u52A0\uFF0C\u6587\u4EF6\u540D\u7EDD\u4E0D\u80FD\u662F Caddyfile.txt\uFF09",
  "help.startMac": "Mac \u542F\u52A8\uFF08\u5728 Caddyfile \u6240\u5728\u76EE\u5F55\u6267\u884C\uFF09",
  "help.startMacCmd": "caddy run --config ./Caddyfile",
  "help.startWin": "Windows \u542F\u52A8\uFF08\u5728 caddy.exe \u6240\u5728\u76EE\u5F55\u7684 PowerShell \u6267\u884C\uFF09",
  "help.startWinCmd": ".caddy.exe run --config .Caddyfile",
  "help.verifyCaddy": "\u9884\u671F\u7ED3\u679C\uFF1A\u7535\u8111\u6D4F\u89C8\u5668\u6253\u5F00 http://127.0.0.1:8081\uFF0C\u4F1A\u5F39\u51FA\u300C\u7528\u6237\u540D/\u5BC6\u7801\u300D\u8F93\u5165\u6846\uFF0C\u7528 dshuser + \u4F60\u7684\u4EE3\u7406\u5BC6\u7801\u80FD\u8FDB\u5165 DSH\u3002\u8FD9\u8BF4\u660E Caddy \u9274\u6743\u5DF2\u751F\u6548\u3002",
  "help.phase4": "\u7B2C 4 \u6B65 \xB7 \u7528 cloudflared \u628A 8081 \u6620\u5C04\u5230\u516C\u7F51",
  "help.tunnelIntro": "\u65B0\u5F00\u7B2C 3 \u4E2A\u7EC8\u7AEF\uFF0C\u6267\u884C\uFF08\u6307\u5411 8081\uFF0C\u4E0D\u662F 3080\uFF09\uFF1A",
  "help.tunnel": "cloudflared tunnel --url http://127.0.0.1:8081",
  "help.verifyTunnel": "\u9884\u671F\u7ED3\u679C\uFF1A\u547D\u4EE4\u8F93\u51FA\u91CC\u4F1A\u51FA\u73B0\u4E00\u884C https://xxx.trycloudflare.com\uFF0C\u8BB0\u4E0B\u8FD9\u4E2A\u94FE\u63A5\uFF08\u514D\u8D39\u4E34\u65F6\u5730\u5740\uFF09",
  "help.phase5": "\u7B2C 5 \u6B65 \xB7 \u624B\u673A\u8FDC\u7A0B\u8BBF\u95EE",
  "help.mobileIntro": "1. \u624B\u673A\u65AD\u5F00\u5F53\u524D WiFi\uFF08\u6216\u7528 4G/5G \u6570\u636E\uFF09\uFF0C\u6253\u5F00\u6D4F\u89C8\u5668\u8BBF\u95EE\u521A\u624D\u8BB0\u4E0B\u7684 https://xxx.trycloudflare.com \u94FE\u63A5",
  "help.mobileAuth": "2. \u6D4F\u89C8\u5668\u4F1A\u5F39\u51FA\u300C\u7528\u6237\u540D/\u5BC6\u7801\u300D\uFF0C\u8F93\u5165 dshuser \u548C\u4F60\u8BBE\u7F6E\u7684\u4EE3\u7406\u5BC6\u7801",
  "help.mobileDone": "3. \u8FDB\u5165 DSH \u9875\u9762\u540E\uFF0C\u5982\u679C\u5F00\u4E86\u9875\u9762\u5BC6\u7801\u9501\uFF0C\u518D\u8F93\u5165\u9875\u9762\u8BBF\u95EE\u5BC6\u7801\u5373\u53EF\u6B63\u5E38\u4F7F\u7528",
  "help.mobileResult": "\u5B8C\u6210\uFF01\u4F60\u73B0\u5728\u5728\u4EFB\u4F55\u6709\u7F51\u7EDC\u7684\u5730\u65B9\u90FD\u80FD\u5B89\u5168\u8BBF\u95EE\u672C\u673A\u7684 DSH\u3002",
  "help.consolidate": "\u5B8C\u6574\u547D\u4EE4\u901F\u67E5\uFF08Mac \u5BF9\u7167\uFF09",
  "help.cmd1": "\u7EC8\u7AEF 1\uFF08\u672C\u673A DSH\uFF09\u5DF2\u8FD0\u884C \u2014 \u4E0D\u9700\u8981\u52A8",
  "help.cmd2": "\u7EC8\u7AEF 2\uFF08Caddy\uFF09\uFF1Acaddy run --config ./Caddyfile",
  "help.cmd3": "\u7EC8\u7AEF 3\uFF08\u96A7\u9053\uFF09\uFF1Acloudflared tunnel --url http://127.0.0.1:8081",
  "help.pitfalls": "\u5E38\u89C1\u5751\uFF08\u7167\u505A\u80FD\u907F\u5751\uFF09\uFF1A",
  "help.pitfall1": "1. Caddyfile \u6587\u4EF6\u540D\u4E0D\u5E26\u4EFB\u4F55\u540E\u7F00\uFF0CWindows \u522B\u5B58\u6210 Caddyfile.txt",
  "help.pitfall2": "2. cloudflared \u96A7\u9053\u5FC5\u987B\u6307\u5411 8081\uFF08Caddy\uFF09\uFF0C\u4E0D\u662F DSH \u539F\u59CB 3080",
  "help.pitfall3": "3. caddy \u4E0E cloudflared \u90FD\u5728\u524D\u53F0\u8FD0\u884C\uFF0C\u5404\u81EA\u5360\u4E00\u4E2A\u7EC8\u7AEF\uFF1B\u5173\u6389\u7EC8\u7AEF\u670D\u52A1\u5C31\u505C",
  "help.pitfall4": "4. \u91CD\u542F\u7535\u8111\u540E caddy \u548C cloudflared \u90FD\u8981\u91CD\u65B0\u624B\u52A8\u542F\u52A8",
  "help.pitfall5": "5. Windows \u9632\u706B\u5899\u82E5\u62E6\u622A 8081\uFF0C\u8BF7\u5728\u9632\u706B\u5899\u5141\u8BB8\u8BE5\u7AEF\u53E3",
  "help.pitfall6": "6. \u624B\u673A\u8FDE\u4E0D\u4E0A\u65F6\u5148\u5728\u672C\u673A\u6D4F\u89C8\u5668\u9A8C\u8BC1 http://127.0.0.1:8081 \u662F\u5426\u5F39\u8D26\u53F7\u5BC6\u7801\uFF08\u6392\u9664 Caddy \u672A\u542F\u52A8\uFF09",
  "help.risk": "\u98CE\u9669\u58F0\u660E\uFF1A\u672C\u63D2\u4EF6\u65E0\u6CD5\u62E6\u622A\u540E\u7AEF HTTP \u63A5\u53E3\uFF1B\u9875\u9762\u5BC6\u7801\u9501\uFF08\u7B49\u7EA7 1\uFF09\u53EA\u9002\u5408\u5185\u7F51\u4FE1\u4EFB\u73AF\u5883\u3002\u771F\u6B63\u5BF9\u5916\u7F51\u5F00\u653E\u65F6\uFF0C\u5FC5\u987B\u7528\u4E0A\u9762\u7684 Caddy\uFF08\u7B49\u7EA7 2\uFF09\u9274\u6743\uFF0C\u4E25\u7981\u628A 3080 \u76F4\u63A5\u66B4\u9732\u5230\u516C\u7F51\u3002",
  "help.stepsDone": "\u4EE5\u4E0A 5 \u6B65\u5168\u90E8\u6EE1\u8DB3\u9884\u671F\u7ED3\u679C\u5373\u4E3A\u8D70\u901A\uFF1B\u82E5\u67D0\u6B65\u672A\u8FBE\u9884\u671F\uFF0C\u8DF3\u5230\u300C\u5E38\u89C1\u5751\u300D\u5BF9\u7167\u6392\u67E5\u3002",
  // Audit findings (severity labels + fallback text lives in the audit lib)
  "audit.severity.danger": "\u9AD8\u5371",
  "audit.severity.warn": "\u8B66\u544A",
  "audit.severity.ok": "\u6B63\u5E38",
  // Overlay
  "overlay.title": "DSH \u5DF2\u9501\u5B9A",
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
  "lock.section": "Page Access Password (Level 1 \xB7 LAN mode)",
  "lock.warning": "Warning: this mode protects the web page ONLY \u2014 /api and /ws endpoints stay exposed. Never tunnel to the public internet; LAN trusted environments only.",
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
  "caddy.section": "Public Security (Level 2 \xB7 needs Caddy reverse proxy)",
  "caddy.warning": "Important: this plugin never downloads or runs Caddy. Everything below is text \u2014 copy it and act manually.",
  "caddy.hashTitle": "Step 1 \xB7 Generate a BCrypt password hash (computed locally in your browser)",
  "caddy.hashPassword": "Proxy access password",
  "caddy.hashRounds": "Rounds",
  "caddy.generateHash": "Generate bcrypt hash",
  "caddy.hashResult": "Generated hash (paste into the Caddyfile below)",
  "caddy.copyHash": "Copy hash",
  "caddy.paramsTitle": "Step 2 \xB7 Caddy parameters",
  "caddy.port": "Proxy listen port (default 8081, do not use 3080)",
  "caddy.backend": "DSH backend URL (default http://127.0.0.1:3080)",
  "caddy.user": "Username (default dshuser)",
  "caddy.generateFile": "Generate full Caddyfile",
  "caddy.fileTitle": "Step 3 \xB7 Generated Caddyfile & start commands",
  "caddy.copyFile": "Copy Caddyfile",
  "caddy.fileError": "Generation failed: ",
  "caddy.mac": "4. macOS terminal command",
  "caddy.win": "\u2464 Windows PowerShell command",
  "caddy.copyMac": "Copy macOS command",
  "caddy.copyWin": "Copy Windows command",
  "caddy.hashFirst": "Generate a bcrypt hash above first",
  "audit.section": "Security Risk Audit",
  "audit.desc": "Conclusions below are computed in your browser from host facts \u2014 advisory only.",
  "audit.listen": "DSH currently listens on: ",
  "audit.unknown": "unknown (audit endpoint unavailable)",
  "audit.error": "Failed to fetch audit info",
  "audit.refresh": "Re-audit",
  "help.section": "Usage Guide",
  "help.intro": `A complete, runnable flow: let a mobile device on a non-LAN network (4G/5G or remote WiFi) securely reach this computer's DSH WebUI. Every step has copyable commands and an "expected result" so you can validate as you go.`,
  "help.mode.intro": "Flow goal",
  "help.mode.inner": "This machine: DSH runs on 127.0.0.1:3080, reachable only locally",
  "help.mode.caddy": "Layer 1 (Caddy): wrap 3080 in a username/password reverse proxy listening on 8081",
  "help.mode.tunnel": "Layer 2 (cloudflared): map 8081 to the public internet via a free https address",
  "help.mode.result": "Result: open the generated https link on your phone, enter username/password, and reach your DSH",
  "help.phase0": "Prepare: confirm your machine",
  "help.p0a": "1. DSH WebUI is running \u2014 you can open http://127.0.0.1:3080 in a browser",
  "help.p0b": "2. Both commands below run in the foreground \u2014 give each its own terminal window (don't reuse the DSH terminal; closing them stops the service)",
  "help.p0c": "3. cloudflared is free with no account needed for temporary tunneling; after a reboot you must restart it manually",
  "help.phase1": "Step 1 \xB7 Install Caddy and cloudflared",
  "help.installMac": "macOS installation (Homebrew, one command for both):",
  "help.installMacCmd": "brew install caddy cloudflared",
  "help.installWin": "Windows installation (download from GitHub Releases, extract into one folder):",
  "help.installWin1": "\u2022 Caddy: https://github.com/caddyserver/caddy/releases pick windows-amd64",
  "help.installWin2": "\u2022 cloudflared: https://github.com/cloudflare/cloudflared/releases pick windows-amd64.exe, rename to cloudflared.exe",
  "help.verifyInstall": "Expected: caddy version and cloudflared --version both print a version number",
  "help.phase2": "Step 2 \xB7 Generate the Caddyfile in this plugin",
  "help.step2a": '1. Go back to the "Public Security" module',
  "help.step2b": '2. In "Step 1" enter your proxy password, click "generate bcrypt hash", copy the hash',
  "help.step2c": '3. In "Step 2" fill the parameters: proxy port 8081 (default), DSH backend http://127.0.0.1:3080 (default), username dshuser (default), and paste the hash',
  "help.step2d": '4. Click "generate full Caddyfile" and copy the whole Caddyfile text from "Step 3"',
  "help.phase3": "Step 3 \xB7 Save the Caddyfile and start Caddy",
  "help.saveMac": "macOS save (create the file where Caddy lives)",
  "help.saveMacCmd": 'cat > Caddyfile <<"EOF"\n(paste the Caddyfile you copied here)\nEOF',
  "help.saveWin": 'Windows save: create a text file, paste, then Save As "Caddyfile" (file type "All files", no extension \u2014 never Caddyfile.txt)',
  "help.startMac": "macOS start (in the directory containing the Caddyfile)",
  "help.startMacCmd": "caddy run --config ./Caddyfile",
  "help.startWin": "Windows start (PowerShell in the directory containing caddy.exe)",
  "help.startWinCmd": ".caddy.exe run --config .Caddyfile",
  "help.verifyCaddy": "Expected: opening http://127.0.0.1:8081 in a browser shows a username/password prompt; entering dshuser + your proxy password reaches DSH. Caddy auth is live.",
  "help.phase4": "Step 4 \xB7 Expose 8081 to the internet via cloudflared",
  "help.tunnelIntro": "Open a 3rd terminal and run (point at 8081, not 3080):",
  "help.tunnel": "cloudflared tunnel --url http://127.0.0.1:8081",
  "help.verifyTunnel": "Expected: the output shows a line like https://xxx.trycloudflare.com \u2014 note this link (free temporary address)",
  "help.phase5": "Step 5 \xB7 Access from your phone",
  "help.mobileIntro": "1. Disconnect your phone from local WiFi (or use 4G/5G) and open the https://xxx.trycloudflare.com link in a browser",
  "help.mobileAuth": "2. A username/password prompt appears \u2014 enter dshuser and your proxy password",
  "help.mobileDone": "3. If the page lock is enabled, enter the page password as well and use DSH normally",
  "help.mobileResult": "Done! You can now securely reach your DSH from anywhere with internet.",
  "help.consolidate": "Quick command reference (macOS)",
  "help.cmd1": "Terminal 1 (local DSH): already running \u2014 leave it",
  "help.cmd2": "Terminal 2 (Caddy): caddy run --config ./Caddyfile",
  "help.cmd3": "Terminal 3 (tunnel): cloudflared tunnel --url http://127.0.0.1:8081",
  "help.pitfalls": "Common pitfalls (avoid by following):",
  "help.pitfall1": "1. The Caddyfile must have no extension \u2014 on Windows never save Caddyfile.txt",
  "help.pitfall2": "2. The cloudflared tunnel must point at 8081 (Caddy), not DSH's original 3080",
  "help.pitfall3": "3. caddy and cloudflared both run in the foreground, each in its own terminal; closing the terminal stops the service",
  "help.pitfall4": "4. After a reboot you must restart caddy and cloudflared manually",
  "help.pitfall5": "5. If Windows Firewall blocks 8081, allow that port",
  "help.pitfall6": "6. Can't connect on your phone? First verify http://127.0.0.1:8081 shows the auth prompt on this machine (rules out Caddy not running)",
  "help.risk": "Risk statement: this plugin cannot intercept backend HTTP endpoints; the page lock (level 1) is only for trusted LAN environments. For real internet exposure you must use the Caddy layer (level 2) auth above \u2014 never expose 3080 directly.",
  "help.stepsDone": 'The flow is complete once all 5 steps meet their expected result; if any step fails, check "Common pitfalls" to troubleshoot.',
  "audit.severity.danger": "HIGH RISK",
  "audit.severity.warn": "WARNING",
  "audit.severity.ok": "OK",
  "overlay.title": "DSH is locked",
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
  const [open, setOpen] = useState(false);
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
  return /* @__PURE__ */ jsxs("li", { className: open ? "dra-card dra-open" : "dra-card", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        className: "dra-card-header",
        "aria-expanded": open,
        onClick: () => setOpen(!open),
        children: [
          /* @__PURE__ */ jsxs("span", { className: "dra-card-head-text", children: [
            /* @__PURE__ */ jsx("span", { className: "dra-card-name", children: t("card.title") }),
            /* @__PURE__ */ jsx("span", { className: "dra-card-description", children: t("card.subtitle") })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "dra-card-chevron" + (open ? " dra-open" : ""), "aria-hidden": true, children: "\u25BE" })
        ]
      }
    ),
    open && /* @__PURE__ */ jsx("div", { className: "dra-card-body", children: /* @__PURE__ */ jsxs("div", { className: "dra-accordion", children: [
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
                    /* @__PURE__ */ jsx("span", { className: "dra-step-num", children: "1" }),
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
                    /* @__PURE__ */ jsx("span", { className: "dra-step-num", children: "2" }),
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
                    /* @__PURE__ */ jsx("span", { className: "dra-step-num", children: "3" }),
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
        openSection === "help" && /* @__PURE__ */ jsxs("div", { className: "dra-acc-body dra-help", children: [
          /* @__PURE__ */ jsx("div", { className: "dra-help-intro", children: t("help.intro") }),
          /* @__PURE__ */ jsxs("div", { className: "dra-help-goal", children: [
            /* @__PURE__ */ jsx("div", { className: "dra-help-goal-title", children: t("help.mode.intro") }),
            /* @__PURE__ */ jsx("div", { className: "dra-help-goal-line", children: t("help.mode.inner") }),
            /* @__PURE__ */ jsx("div", { className: "dra-help-goal-line", children: t("help.mode.caddy") }),
            /* @__PURE__ */ jsx("div", { className: "dra-help-goal-line", children: t("help.mode.tunnel") }),
            /* @__PURE__ */ jsx("div", { className: "dra-help-goal-line dra-help-goal-result", children: t("help.mode.result") })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "dra-help-phase", children: [
            /* @__PURE__ */ jsx("div", { className: "dra-help-phase-title", children: t("help.phase0") }),
            /* @__PURE__ */ jsxs("ul", { className: "dra-help-list", children: [
              /* @__PURE__ */ jsx("li", { children: t("help.p0a") }),
              /* @__PURE__ */ jsx("li", { children: t("help.p0b") }),
              /* @__PURE__ */ jsx("li", { children: t("help.p0c") })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "dra-help-phase", children: [
            /* @__PURE__ */ jsx("div", { className: "dra-help-phase-title", children: t("help.phase1") }),
            /* @__PURE__ */ jsx("div", { className: "dra-help-sub", children: t("help.installMac") }),
            /* @__PURE__ */ jsx("pre", { className: "dra-help-code", children: t("help.installMacCmd") }),
            /* @__PURE__ */ jsx("div", { className: "dra-help-sub", children: t("help.installWin") }),
            /* @__PURE__ */ jsxs("ul", { className: "dra-help-list", children: [
              /* @__PURE__ */ jsx("li", { children: t("help.installWin1") }),
              /* @__PURE__ */ jsx("li", { children: t("help.installWin2") })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "dra-help-expected", children: t("help.verifyInstall") })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "dra-help-phase", children: [
            /* @__PURE__ */ jsx("div", { className: "dra-help-phase-title", children: t("help.phase2") }),
            /* @__PURE__ */ jsxs("ul", { className: "dra-help-list", children: [
              /* @__PURE__ */ jsx("li", { children: t("help.step2a") }),
              /* @__PURE__ */ jsx("li", { children: t("help.step2b") }),
              /* @__PURE__ */ jsx("li", { children: t("help.step2c") }),
              /* @__PURE__ */ jsx("li", { children: t("help.step2d") })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "dra-help-phase", children: [
            /* @__PURE__ */ jsx("div", { className: "dra-help-phase-title", children: t("help.phase3") }),
            /* @__PURE__ */ jsx("div", { className: "dra-help-sub", children: t("help.saveMac") }),
            /* @__PURE__ */ jsx("pre", { className: "dra-help-code", children: t("help.saveMacCmd") }),
            /* @__PURE__ */ jsx("div", { className: "dra-help-sub", children: t("help.saveWin") }),
            /* @__PURE__ */ jsx("div", { className: "dra-help-sub", children: t("help.startMac") }),
            /* @__PURE__ */ jsx("pre", { className: "dra-help-code", children: t("help.startMacCmd") }),
            /* @__PURE__ */ jsx("div", { className: "dra-help-sub", children: t("help.startWin") }),
            /* @__PURE__ */ jsx("pre", { className: "dra-help-code", children: t("help.startWinCmd") }),
            /* @__PURE__ */ jsx("div", { className: "dra-help-expected", children: t("help.verifyCaddy") })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "dra-help-phase", children: [
            /* @__PURE__ */ jsx("div", { className: "dra-help-phase-title", children: t("help.phase4") }),
            /* @__PURE__ */ jsx("div", { className: "dra-help-sub", children: t("help.tunnelIntro") }),
            /* @__PURE__ */ jsx("pre", { className: "dra-help-code dra-help-tunnel", children: t("help.tunnel") }),
            /* @__PURE__ */ jsx("div", { className: "dra-help-expected", children: t("help.verifyTunnel") })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "dra-help-phase", children: [
            /* @__PURE__ */ jsx("div", { className: "dra-help-phase-title", children: t("help.phase5") }),
            /* @__PURE__ */ jsxs("ul", { className: "dra-help-list", children: [
              /* @__PURE__ */ jsx("li", { children: t("help.mobileIntro") }),
              /* @__PURE__ */ jsx("li", { children: t("help.mobileAuth") }),
              /* @__PURE__ */ jsx("li", { children: t("help.mobileDone") })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "dra-help-goal-line dra-help-goal-result", children: t("help.mobileResult") })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "dra-help-phase", children: [
            /* @__PURE__ */ jsx("div", { className: "dra-help-phase-title", children: t("help.consolidate") }),
            /* @__PURE__ */ jsx("div", { className: "dra-help-plain", children: t("help.cmd1") }),
            /* @__PURE__ */ jsx("pre", { className: "dra-help-code", children: t("help.cmd2") }),
            /* @__PURE__ */ jsx("pre", { className: "dra-help-code", children: t("help.cmd3") })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "dra-help-phase", children: [
            /* @__PURE__ */ jsx("div", { className: "dra-help-phase-title", children: t("help.pitfalls") }),
            /* @__PURE__ */ jsxs("ul", { className: "dra-help-list", children: [
              /* @__PURE__ */ jsx("li", { children: t("help.pitfall1") }),
              /* @__PURE__ */ jsx("li", { children: t("help.pitfall2") }),
              /* @__PURE__ */ jsx("li", { children: t("help.pitfall3") }),
              /* @__PURE__ */ jsx("li", { children: t("help.pitfall4") }),
              /* @__PURE__ */ jsx("li", { children: t("help.pitfall5") }),
              /* @__PURE__ */ jsx("li", { children: t("help.pitfall6") })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "dra-banner-danger", children: t("help.risk") }),
          /* @__PURE__ */ jsx("div", { className: "dra-help-stepsdone", children: t("help.stepsDone") })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  RemoteAccessCard
};
