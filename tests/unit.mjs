/**
 * Unit tests for the pure-logic layer: caddy generation, token primitives,
 * audit classification, and the bcrypt wrapper. Imports the TypeScript source
 * directly (Node 24 native type stripping) — no build output involved.
 */

import {
  assert, assertEqual, assertDeepEqual, assertThrows, summary, FIXTURE_HASH, FIXTURE_PASSWORD,
} from './helpers.mjs'
import {
  buildCaddyfile, macCommand, winCommand, validateCaddy, isCaddyValid, isBcryptHash,
  normalizePort, CADDY_DEFAULT_PORT, CADDY_DEFAULT_BACKEND, CADDY_DEFAULT_USER,
} from '../src/lib/caddy.ts'
import { createToken, isTokenValid, tokenRemainingSeconds, TOKEN_STORAGE_KEY, DEFAULT_TOKEN_TTL_HOURS } from '../src/lib/token.ts'
import {
  audit, isTunnelHostname, listensOnAllInterfaces, isLoopbackHostname, normalizeHostname,
  collectEnvHints,
} from '../src/lib/audit.ts'
import { hashPassword, verifyPassword, clampRounds, getHashRounds, DEFAULT_BCRYPT_ROUNDS, MIN_BCRYPT_ROUNDS, MAX_BCRYPT_ROUNDS } from '../src/lib/bcrypt.ts'

const NOW = 1_700_000_000_000

// ---------------------------------------------------------------------------
// caddy.ts
// ---------------------------------------------------------------------------
{
  // Exact output shape from the plugin spec.
  const out = buildCaddyfile({ port: 8081, hash: FIXTURE_HASH })
  assertDeepEqual(out, [
    ':8081 {',
    '    basicauth * {',
    `        dshuser ${FIXTURE_HASH}`,
    '    }',
    '    reverse_proxy http://127.0.0.1:3080 {',
    '        websocket',
    '    }',
    '}',
    '',
  ].join('\n'), 'buildCaddyfile default shape')

  // Custom port / backend / user.
  const custom = buildCaddyfile({ port: 9090, hash: FIXTURE_HASH, backend: 'http://192.168.1.10:3080', user: 'alice' })
  assert(custom.includes(':9090 {'), 'custom port rendered')
  assert(custom.includes('alice ' + FIXTURE_HASH), 'custom user rendered')
  assert(custom.includes('reverse_proxy http://192.168.1.10:3080'), 'custom backend rendered')

  // String port accepted.
  const strPort = buildCaddyfile({ port: '8081', hash: FIXTURE_HASH })
  assert(strPort.includes(':8081 {'), 'string port accepted')

  // Commands.
  assert(macCommand().includes('caddy run --config ./Caddyfile'), 'mac command')
  assert(winCommand().includes('.\\caddy.exe run --config .\\Caddyfile'), 'win command')

  // Validation.
  assertDeepEqual(validateCaddy({ port: 8081, hash: FIXTURE_HASH }), {}, 'valid input has no errors')
  assert(isCaddyValid({ port: 8081, hash: FIXTURE_HASH }), 'valid input passes isCaddyValid')
  assert(!isCaddyValid({ port: 3080, hash: FIXTURE_HASH }), 'port 3080 rejected (DSH itself)')
  assert(!isCaddyValid({ port: 8081, hash: 'not-a-hash' }), 'malformed hash rejected')
  assert(!isCaddyValid({ port: 8081, hash: '' }), 'empty hash rejected')
  assert(!isCaddyValid({ port: 8081, hash: FIXTURE_HASH, backend: 'ftp://x' }), 'non-http backend rejected')
  assert(!isCaddyValid({ port: 8081, hash: FIXTURE_HASH, user: 'a b' }), 'user with space rejected')
  assertThrows(() => buildCaddyfile({ port: 8081, hash: 'x' }), 'buildCaddyfile throws on invalid input')

  // isBcryptHash.
  assert(isBcryptHash(FIXTURE_HASH), 'fixture hash passes isBcryptHash')
  assert(isBcryptHash('$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0'), '2a prefix ok')
  assert(isBcryptHash('$2y$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0'), '2y prefix ok')
  assert(!isBcryptHash('$1$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0'), 'wrong prefix')
  assert(!isBcryptHash(FIXTURE_HASH + 'x'), 'too long rejected')
  assert(!isBcryptHash(''), 'empty rejected')

  // normalizePort.
  assertEqual(normalizePort('8081'), 8081, 'normalizePort string')
  assertEqual(normalizePort(8081), 8081, 'normalizePort number')
  assertEqual(normalizePort(' 8081 '), 8081, 'normalizePort trims')
  assert(Number.isNaN(normalizePort('abc')), 'normalizePort NaN')
  assertEqual(normalizePort(''), 0, 'normalizePort empty -> 0')

  // Defaults.
  assertEqual(CADDY_DEFAULT_PORT, 8081, 'default port')
  assertEqual(CADDY_DEFAULT_BACKEND, 'http://127.0.0.1:3080', 'default backend')
  assertEqual(CADDY_DEFAULT_USER, 'dshuser', 'default user')
}

// ---------------------------------------------------------------------------
// token.ts
// ---------------------------------------------------------------------------
{
  const token = createToken(72, NOW)
  assertEqual(typeof token.v, 'string', 'token has value')
  assert(token.v.length >= 40, 'token value is long enough')
  assertEqual(token.exp, NOW + 72 * 3_600_000, 'token expiry exact')

  assert(isTokenValid(token, NOW), 'token valid at creation')
  assert(isTokenValid(token, token.exp - 1), 'token valid one ms before expiry')
  assert(!isTokenValid(token, token.exp), 'token invalid exactly at expiry')
  assert(!isTokenValid(token, token.exp + 1), 'token invalid after expiry')

  // Malformed inputs.
  assert(!isTokenValid(null, NOW), 'null invalid')
  assert(!isTokenValid(undefined, NOW), 'undefined invalid')
  assert(!isTokenValid('string', NOW), 'string invalid')
  assert(!isTokenValid({ v: 'x' }, NOW), 'missing exp invalid')
  assert(!isTokenValid({ exp: NOW + 1000 }, NOW), 'missing v invalid')
  assert(!isTokenValid({ v: '', exp: NOW + 1000 }, NOW), 'empty v invalid')
  assert(!isTokenValid({ v: 'abc', exp: 'not-a-number' }, NOW), 'string exp invalid')
  assert(!isTokenValid({ v: 'abc', exp: NaN }, NOW), 'NaN exp invalid')
  assert(!isTokenValid({ v: 'abc', exp: Infinity }, NOW), 'Infinity exp invalid')

  // Expired token.
  const expired = createToken(-1, NOW)
  assert(!isTokenValid(expired, NOW), 'negative TTL yields expired token')
  assertEqual(tokenRemainingSeconds(token, NOW), 72 * 3600, 'remaining seconds')
  assertEqual(tokenRemainingSeconds({ v: 'x', exp: NOW - 5000 }, NOW), -5, 'expired remaining negative')
  assertEqual(tokenRemainingSeconds(null, NOW), -1, 'null remaining -1')

  // Deterministic RNG injection.
  const fakeRandom = (n) => new Uint8Array(n)
  const t2 = createToken(1, NOW, fakeRandom)
  assertEqual(t2.v, '00'.repeat(24), 'injected RNG produces zero hex')
  assertEqual(DEFAULT_TOKEN_TTL_HOURS, 72, 'default ttl')
  assertEqual(TOKEN_STORAGE_KEY, 'dsh-remote-access.token', 'storage key')
}

// ---------------------------------------------------------------------------
// audit.ts
// ---------------------------------------------------------------------------
{
  // Hostname normalization.
  assertEqual(normalizeHostname('LOCALHOST'), 'localhost', 'lowercases')
  assertEqual(normalizeHostname('Example.COM:8080'), 'example.com', 'strips port')
  assertEqual(normalizeHostname('[::1]:8080'), '::1', 'bracket ipv6')
  assertEqual(normalizeHostname('  spaced.com '), 'spaced.com', 'trims')

  assert(listensOnAllInterfaces('0.0.0.0'), '0.0.0.0 is all-interfaces')
  assert(listensOnAllInterfaces('::'), ':: is all-interfaces')
  assert(!listensOnAllInterfaces('127.0.0.1'), 'loopback not all-interfaces')
  assert(!listensOnAllInterfaces(undefined), 'undefined not all-interfaces')

  assert(isLoopbackHostname('localhost'), 'localhost loopback')
  assert(isLoopbackHostname('127.0.0.1'), '127.0.0.1 loopback')
  assert(!isLoopbackHostname('trycloudflare.com'), 'tunnel not loopback')

  assert(isTunnelHostname('abc.trycloudflare.com'), 'trycloudflare detected')
  assert(isTunnelHostname('myhost.frp.example.com'), 'frp fragment detected')
  assert(isTunnelHostname('x.ngrok.io'), 'ngrok detected')
  assert(!isTunnelHostname('localhost'), 'localhost not tunnel')
  assert(!isTunnelHostname('192.168.1.5'), 'LAN IP not tunnel')

  // Full audit classification.
  const safe = audit({ listenHost: '127.0.0.1', listenPort: 3080, pageHostname: 'localhost', pageProtocol: 'http:', lockConfigured: true })
  const dangers = safe.filter(f => f.severity === 'danger')
  const oks = safe.filter(f => f.severity === 'ok')
  assertEqual(dangers.length, 0, 'loopback + localhost has no dangers')
  assert(oks.length >= 2, 'loopback + lock produces ok findings')

  const exposed = audit({ listenHost: '0.0.0.0', listenPort: 3080, pageHostname: 'localhost', pageProtocol: 'http:' })
  assert(exposed.some(f => f.severity === 'danger' && f.key === 'audit.listenAllInterfaces'), '0.0.0.0 flagged danger')

  const tunnel = audit({ listenHost: '127.0.0.1', pageHostname: 'abc.trycloudflare.com', pageProtocol: 'https:' })
  assert(tunnel.some(f => f.severity === 'danger' && f.key === 'audit.tunnelHostname'), 'tunnel hostname flagged danger')

  const envHinted = audit({ listenHost: '127.0.0.1', envHints: ['CLOUDFLARED_TUNNEL_ID'] })
  assert(envHinted.some(f => f.key === 'audit.envHint' && f.severity === 'warn'), 'env hint flagged warn')

  const noLock = audit({ listenHost: '127.0.0.1', pageHostname: 'localhost' })
  assert(noLock.some(f => f.key === 'audit.lockMissing' && f.severity === 'warn'), 'missing lock warned')

  // Determinism.
  const a = audit({ listenHost: '0.0.0.0', pageHostname: 'x.trycloudflare.com', envHints: ['FRP_SERVER_ADDR'] })
  const b = audit({ listenHost: '0.0.0.0', pageHostname: 'x.trycloudflare.com', envHints: ['FRP_SERVER_ADDR'] })
  assertDeepEqual(a, b, 'audit deterministic')
}

// ---------------------------------------------------------------------------
// bcrypt.ts
// ---------------------------------------------------------------------------
{
  const hash = await hashPassword(FIXTURE_PASSWORD, 4)
  assert(isBcryptHash(hash), 'generated hash has bcrypt shape')
  assertEqual(hash.length, 60, 'bcrypt hash length 60')
  assert(await verifyPassword(FIXTURE_PASSWORD, hash), 'correct password verifies')
  assert(!(await verifyPassword('wrong-password', hash)), 'wrong password rejected')
  assert(await verifyPassword(FIXTURE_PASSWORD, FIXTURE_HASH), 'fixture hash verifies')

  assertEqual(getHashRounds(FIXTURE_HASH), 4, 'getHashRounds parses cost')
  assertEqual(getHashRounds('garbage'), -1, 'getHashRounds on garbage -1')

  assertEqual(clampRounds(12), 12, 'clamp keeps 12')
  assertEqual(clampRounds(0), MIN_BCRYPT_ROUNDS, 'clamp low bound')
  assertEqual(clampRounds(99), MAX_BCRYPT_ROUNDS, 'clamp high bound')
  assertEqual(clampRounds(undefined), DEFAULT_BCRYPT_ROUNDS, 'clamp undefined -> default')
  assertEqual(clampRounds(NaN), DEFAULT_BCRYPT_ROUNDS, 'clamp NaN -> default')
  assertEqual(clampRounds(12.9), 12, 'clamp truncates')

  // 72-byte bcrypt limit: identical prefixes beyond 72 bytes are ignored.
  const longA = 'a'.repeat(100) + 'tail-A'
  const longB = 'a'.repeat(100) + 'tail-B'
  const hA = await hashPassword(longA, 4)
  const hB = await hashPassword(longB, 4)
  assert(hA !== hB, 'different salts still differ')
  assert(await verifyPassword(longA, hA), 'longA verifies against hA')
  assert(await verifyPassword(longB, hA), '72-byte truncation: longB (same prefix) also verifies against hA')
}

summary('unit')
