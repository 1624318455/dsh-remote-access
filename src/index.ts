/**
 * dsh-remote-access — Host half.
 *
 * A pure-computation plugin: it never spawns a subprocess, never writes a file,
 * and never starts a server. Everything it produces is string text the browser
 * copies (Caddyfile, commands, bcrypt hashes) plus two tiny JSON API routes the
 * client card consumes:
 *
 *   POST /dsh-remote-access/api/verify   { password } -> { ok, configured }
 *   GET  /dsh-remote-access/api/audit    -> { host, port, envHints, lockConfigured, pageLockEnabled }
 *
 * The page-password bcrypt hash lives in the `dsh-remote-access` settings
 * namespace with `role('secret')`, so it is redacted from every client read;
 * verification therefore happens host-side through the verify route.
 *
 * @module dsh-remote-access
 */

import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { installSettingsSection, settingsNamespace } from '@deepseek-ai/dsh-settings'
// Type-only: pulls the ctx.webServer Context merge.
import type {} from '@deepseek-ai/dsh-host-webserver'
import { verifyPassword } from './lib/bcrypt.ts'
import { collectEnvHints } from './lib/audit.ts'

/** Cordis plugin name used by loader diagnostics. */
export const name = 'dsh-remote-access'

/** Hard dependency: the browser HTTP carrier this plugin registers routes on. */
export const inject = ['webServer']

/** Settings namespace owning every dsh-remote-access configuration field. */
export const NS = settingsNamespace('dsh-remote-access')

export interface Config {
  /** bcrypt hash of the page-lock password (secret — never sent to the client). */
  pagePasswordHash?: string
  /** Whether the page lock is currently active. */
  pageLockEnabled?: boolean
  /** Lifetime of a page-lock token in hours (client reads this to mint tokens). */
  tokenTtlHours?: number
  /** Caddy proxy listen port (default 8081, must not collide with DSH 3080). */
  caddyPort?: number
  /** DSH backend URL the Caddyfile reverse-proxies to. */
  dshBackend?: string
  /** Basic-auth username in the generated Caddyfile. */
  caddyUser?: string
  /** bcrypt cost factor the browser hash generator uses (default 12). */
  bcryptRounds?: number
}

export const Config: z<Config> = z.object({
  pagePasswordHash: z.string().role('secret').description('页面密码锁的 bcrypt 哈希（浏览器前端计算，仅宿主可读）。'),
  pageLockEnabled: z.boolean().description('是否启用页面密码锁（安全等级 1）。'),
  tokenTtlHours: z.number().step(1).min(1).max(24 * 365).description('页面锁 token 有效小时数。'),
  caddyPort: z.number().step(1).min(1).max(65535).description('Caddy 代理监听端口（默认 8081，不要用 3080）。'),
  dshBackend: z.string().description('DSH 后端地址（Caddy reverse_proxy 目标）。'),
  caddyUser: z.string().description('Caddy basic auth 用户名。'),
  bcryptRounds: z.number().step(1).min(4).max(31).description('bcrypt 哈希轮数（前端哈希生成器使用）。'),
})

/** Write a JSON response with a helper the route handlers share. */
function writeJson(res: import('node:http').ServerResponse, status: number, payload: unknown): void {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(payload))
}

/** Read and JSON-parse the request body; malformed bodies yield an empty object. */
async function readJsonBody(req: import('node:http').IncomingMessage): Promise<Record<string, unknown>> {
  let body = ''
  for await (const chunk of req) body += chunk
  if (!body) return {}
  try {
    const parsed = JSON.parse(body) as unknown
    return parsed !== null && typeof parsed === 'object' ? parsed as Record<string, unknown> : {}
  } catch {
    return {}
  }
}

export function apply(ctx: Context, config: Config): void {
  // The authoritative configuration source: the resolved settings scope while
  // the settings service is attached, the composition entry otherwise.
  let current: () => Config = () => config
  installSettingsSection(ctx, NS, Config, config, {
    setSource: (source) => { current = source },
    onChange: () => {},
  })

  // --- POST /dsh-remote-access/api/verify --------------------------------
  // The only place the secret hash is ever compared. The plaintext password
  // travels from the browser to the same host — acceptable for an intranet
  // page lock (security level 1, per the plugin spec).
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/dsh-remote-access/api/verify',
    async handler(req, res) {
      const body = await readJsonBody(req)
      const password = typeof body.password === 'string' ? body.password : ''
      const hash = current().pagePasswordHash
      if (!hash) {
        writeJson(res, 200, { ok: false, configured: false })
        return
      }
      const ok = await verifyPassword(password, hash)
      writeJson(res, 200, { ok, configured: true })
    },
  }), 'dsh-remote-access: verify route')

  // --- GET /dsh-remote-access/api/audit ----------------------------------
  // Feeds the security-risk audit panel: the real DSH listen address (from the
  // webserver this very plugin registers on) plus tunnel-ish env hints. Pure
  // reads — no process inspection, no shell.
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/dsh-remote-access/api/audit',
    handler(req, res) {
      const webServer = ctx.get('webServer')
      const cfg = current()
      writeJson(res, 200, {
        host: webServer?.host ?? null,
        port: webServer?.port ?? null,
        envHints: collectEnvHints(process.env as Record<string, string | undefined>),
        lockConfigured: Boolean(cfg.pagePasswordHash),
        pageLockEnabled: Boolean(cfg.pageLockEnabled),
        tokenTtlHours: cfg.tokenTtlHours,
      })
    },
  }), 'dsh-remote-access: audit route')
}
