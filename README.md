# dsh-remote-access

DSH 鉴权辅助插件：页面密码锁，同时生成 Caddy 反向代理配置，实现真正安全的公网访问。

> 定位：DSH 插件，**不执行任何系统命令、不生成子进程**；仅在插件 WebUI 内完成计算、文本生成、风险审计。
> 安全边界：插件本身**无法拦截后端 `/api`、`/ws`**；公网场景必须依靠外部 Caddy 反向代理。
> 适用：Mac / Windows，可通过 dsh-market 一键安装。

## ⚠️ 重要安全声明

1. DSH 内核缺少 HTTP 中间件钩子，**纯插件无法拦截 `/api`、`/ws` websocket 接口**。
2. 安全等级 1（仅页面弹窗）：仅适合内网信任环境，**严禁直接公网穿透**。
3. 需要对外网暴露访问时，必须使用安全等级 2，配合 Caddy 反向代理。
4. 本主推路径**不依赖 dsh-subprocess-local**，没有 shell 执行风险。

## 功能清单

1. **前端页面鉴权弹窗（安全等级 1：内网信任环境）**
   - 打开 DSH WebUI，插件优先校验浏览器 localStorage 内保存的访问 token
   - 未授权：弹出密码输入模态框，没有密码禁止进入聊天界面
   - 输入正确密码，生成 token 存入 localStorage；刷新页面记住授权状态
   - ⚠️ UI 常驻提示：该模式仅保护网页，API/WebSocket 接口仍然裸漏，禁止公网穿透

2. **内置前端 BCrypt 哈希生成器（JS 前端计算，不调用系统工具）**
   - 用户输入明文密码，浏览器内直接算出 bcrypt 哈希值
   - 一键复制哈希字符串，直接粘贴到 Caddyfile

3. **跨平台 Caddy 配置生成器**
   - 输入代理端口（默认 `8081`，不要和 DSH 的 3080 冲突）
   - 填入生成好的 bcrypt 哈希
   - 一键复制完整 `Caddyfile` 配置文本
   - 分别输出 **Mac 终端命令**、**Windows PowerShell 命令**，复制即用

4. **安全风险审计面板（核心差异化）**
   - 检测 DSH 配置：是否监听 `0.0.0.0`
   - 检测环境提示：cloudflared/frp 等公网隧道属于高危
   - 区分展示两个安全等级，红色醒目警告

5. **使用指引面板**
   - 一套完整的端到端流程：让手机等移动设备在非局域网（4G/5G/异地 WiFi）下安全远程访问本机 DSH WebUI
   - 分阶段步骤卡（准备 → 安装 → 生成配置 → 启动 Caddy → 公网映射 → 手机访问），每步含**可复制命令**与**预期结果**验证
   - Caddy / cloudflared 安装指引（Mac / Windows 分开）
   - 完整命令速查 + 常见坑排查 + 风险声明

> 重要：**所有输出仅仅是字符串文本，交给用户复制，插件不会写文件、不会启动程序**。

## UI 面板结构（折叠面板 · 层层递进）

设置卡片采用**两层折叠**，参考「网页搜索」插件的卡片样式：

- **最外层**：一张「DSH 远程访问鉴权」卡片（名称 + 描述 + 折叠箭头），**默认折叠**，点击后才展开露出内层 4 个模块 —— 不会把设置一股脑压在插件列表里。
- **内层**：折叠面板一次展开一个模块（头部带实时状态徽章）；公网安全配置内部再按步骤折叠，生成哈希后自动展开下一步。

```
# DSH 远程访问鉴权（最外层卡片，默认折叠，点击展开）

## 内层折叠面板（一次展开一个，头部显示状态徽章）
▸ 页面访问密码【安全等级1｜内网模式】   ← 展开卡片后默认打开 · 徽章：页面锁已启用/未启用
│   警告：仅保护Web页面，/api /ws接口未防护，禁止公网穿透
│   [输入框：设置页面密码] [保存密码]
│   [清除本地授权token（测试用）] [关闭页面锁]
▸ 公网安全配置【安全等级2｜需要Caddy反向代理】  · 徽章：哈希已生成/待生成哈希
│   └─ 内层步骤折叠（生成哈希后自动展开下一步）
│      步骤1 生成BCrypt密码哈希（前端本地计算）→ [复制哈希]
│      步骤2 Caddy配置参数（端口/后端/账号）→ [生成完整Caddyfile]
│      步骤3 生成的Caddyfile + Mac/Windows启动命令 → [一键复制]
▸ 安全风险审计  · 徽章：审计正常 / N 项高危 / 待审计
▸ 小白使用指引
```

## 生成的 Caddyfile

```caddyfile
:8081 {
    basicauth * {
        dshuser $2a$14$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    }
    reverse_proxy http://127.0.0.1:3080 {
        websocket
    }
}
```

### Mac 启动命令

```bash
# 将下面Caddyfile保存到当前目录
# 执行启动
caddy run --config ./Caddyfile
```

### Windows PowerShell 启动命令

```powershell
# 将下面Caddyfile保存为 Caddyfile (无后缀)
# 切换到caddy.exe所在目录，执行
.\caddy.exe run --config .\Caddyfile
```

## 快速开始

### 场景 A：仅内网使用（安全等级 1，不使用 Caddy）

> ⚠️ 红色警告：**API/WebSocket 未受保护，严禁公网穿透，仅家庭局域网可信环境**

1. 进入插件设置面板，设置页面访问密码
2. 浏览器会保存授权 token；刷新页面需要密码解锁网页
3. 手机连同一个局域网，访问电脑 ip:3080；网页需要密码登录

> 缺点：别人直接访问 `http://电脑ip:3080/api/chat/completions` 可以绕过页面直接调用模型。

### 场景 B：公网穿透（出门手机访问，安全等级 2，真正安全，必须 Caddy）

1. 在插件面板输入你的密码，点击生成 bcrypt 哈希（JS 前端运算）
2. 将生成哈希填入表单，设置代理端口默认 `8081`
3. 复制生成的完整 `Caddyfile` 文本
4. 手动下载对应系统的 Caddy 二进制
   - Mac：下载对应 arm64 版本；可以 `brew install caddy`
   - Windows：下载 windows-amd64 的 `caddy.exe`，无需安装，解压即可
5. 将复制出来的 `Caddyfile` 保存到 caddy 二进制同一个目录（**不要加 .txt 后缀**）
6. 新开独立终端窗口，复制对应系统的启动命令运行 caddy
7. 验证代理是否生效：浏览器访问 `http://127.0.0.1:8081`，会弹出浏览器基础账号密码框
8. **启动 cloudflared 隧道指向代理端口 8081，而不是原始 3080**

```bash
cloudflared tunnel --url http://127.0.0.1:8081
```

9. 使用 cloudflared 输出的 https 链接在手机访问；浏览器弹出账号密码，输入后进入 DSH

> 关闭流程：
> 1. `Ctrl+C` 关闭 cloudflared
> 2. `Ctrl+C` 关闭 caddy；DSH 本体可以继续运行

## 踩坑清单

1. Windows 保存 Caddyfile，系统不要自动追加 `.txt` 后缀，文件名就是 `Caddyfile`。
2. caddy 和 cloudflared 必须新开独立终端，不能占用 DSH 进程。
3. cloudflared 隧道目标地址是代理端口 `8081`，**不是 DSH 原始 3080**。
4. 重启电脑，caddy、cloudflared 都需要重新手动启动。
5. Windows 防火墙可能拦截 8081 端口，需要允许访问。

## 与竞品 dsh-AuthInOne 的差异化

1. 同样具备前端页面密码弹窗。
2. 内置前端 bcrypt 哈希生成，用户不需要本地装工具。
3. 一键输出跨平台完整 Caddy 配置 + Mac/Windows 启动命令，引导用户做到真正接口鉴权。
4. 增加安全审计，识别危险监听配置，强风险告警。
5. 完整文档区分两种安全等级，减少用户误用裸奔公网。

## 开发与测试

```bash
pnpm install
npm run build        # tsdown → lib/index.js + lib/client.js
npm test             # 248 条断言：冒烟 + 客户端加载 + 单元 + 边界 + 模拟场景
```

## 架构

- **Host half**（`lib/index.js`）：注册 `dsh-remote-access` 设置命名空间（页面密码哈希为 secret，从不发给客户端）；注册两个 JSON API：
  - `POST /dsh-remote-access/api/verify` — 宿主侧 bcrypt 校验页面密码
  - `GET /dsh-remote-access/api/audit` — 返回 DSH 真实监听地址与隧道环境变量提示
- **Client half**（`lib/client.js`）：设置卡片（5 个面板区块）+ `shell.overlay` 全屏页面锁；bcryptjs 内联进浏览器 bundle（crypto 已 shim 为 Web Crypto）。

## License

MIT
