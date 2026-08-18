/**
 * Boundary tests for dsh-remote-access — adversarial edge cases around the
 * Caddy generator, token lifecycle, audit classifier, and bcrypt wrapper.
 */

import { assert, assertEqual, assertThrows, summary, FIXTURE_HASH } from './helpers.mjs'
import { buildCaddyfile, validateCaddy, isBcryptHash } from '../src/lib/caddy.ts'
import { createToken, isTokenValid } from '../src/lib/token.ts'
import { audit, normalizeHostname, isTunnelHostname, collectEnvHints } from '../src/lib/audit.ts'
import { hashPassword, verifyPassword, clampRounds } from '../src/lib/bcrypt.ts'

const NOW = 1_700_000_000_000

// --- port boundaries -------------------------------------------------------
{
  assert(validateCaddy({ port: 0, hash: FIXTURE_HASH }).port, 'port 0 invalid')
  assert(validateCaddy({ port: -1, hash: FIXTURE_HASH }).port, 'port -1 invalid')
  assert(validateCaddy({ port: 65536, hash: FIXTURE_HASH }).port, 'port 65536 invalid')
  assert(validateCaddy({ port: 99999, hash: FIXTURE_HASH }).port, 'port 99999 invalid')
  assert(validateCaddy({ port: 1.5, hash: FIXTURE_HASH }).port, 'port 1.5 invalid (not integer)')
  assert(validateCaddy({ port: NaN, hash: FIXTURE_HASH }).port, 'port NaN invalid')
  assert(validateCaddy({ port: Infinity, hash: FIXTURE_HASH }).port, 'port Infinity invalid')
  assert(validateCaddy({ port: 'abc', hash: FIXTURE_HASH }).port, 'port abc invalid')
  assert(validateCaddy({ port: '', hash: FIXTURE_HASH }).port, 'port empty invalid')
  assert(validateCaddy({ port: 3080, hash: FIXTURE_HASH }).port, 'port 3080 invalid (DSH collision)')
  assert(!validateCaddy({ port: 1, hash: FIXTURE_HASH }).port, 'port 1 valid')
  assert(!validateCaddy({ port: 65535, hash: FIXTURE_HASH }).port, 'port 65535 valid')
  assertEqual(buildCaddyfile({ port: 1, hash: FIXTURE_HASH }).includes(':1 {'), true, 'port 1 renders')
  assertEqual(buildCaddyfile({ port: 65535, hash: FIXTURE_HASH }).includes(':65535 {'), true, 'port 65535 renders')
  // Whitespace port input.
  assert(!validateCaddy({ port: '  8081  ', hash: FIXTURE_HASH }).port, 'whitespace port trims to valid')
}

// --- hash boundaries ----------------------------------------------------------
{
  assert(isBcryptHash('$2a$04$' + 'a'.repeat(53)), 'min cost 2 digits + 53 body ok')
  assert(isBcryptHash('$2b$31$' + 'a'.repeat(53)), 'max cost 31 ok')
  assert(!isBcryptHash('$2a$4$' + 'a'.repeat(53)), 'single digit cost rejected')
  assert(!isBcryptHash('$2a$100$' + 'a'.repeat(53)), '3 digit cost rejected')
  assert(!isBcryptHash('$2a$04$' + 'a'.repeat(52)), '52 body rejected')
  assert(!isBcryptHash('$2a$04$' + 'a'.repeat(54)), '54 body rejected')
  assert(!isBcryptHash('$2a$04$' + '-'.repeat(53)), 'hyphen not in alphabet')
  assert(!isBcryptHash('$2a$04$' + '_'.repeat(53)), 'underscore not in alphabet')
  assert(!isBcryptHash('$2x$04$' + 'a'.repeat(53)), '2x prefix rejected')
}

// --- backend / user boundaries ------------------------------------------------
{
  assert(validateCaddy({ port: 8081, hash: FIXTURE_HASH, backend: '' }).backend, 'empty backend invalid')
  assert(validateCaddy({ port: 8081, hash: FIXTURE_HASH, backend: '127.0.0.1:3080' }).backend, 'no scheme invalid')
  assert(validateCaddy({ port: 8081, hash: FIXTURE_HASH, backend: 'javascript:alert(1)' }).backend, 'javascript scheme invalid')
  assert(validateCaddy({ port: 8081, hash: FIXTURE_HASH, backend: 'http://' }).backend, 'scheme only invalid')
  assert(!validateCaddy({ port: 8081, hash: FIXTURE_HASH, backend: 'https://127.0.0.1:3080/path' }).backend, 'https with path ok')
  assert(validateCaddy({ port: 8081, hash: FIXTURE_HASH, user: 'user name' }).user, 'space in user invalid')
  assert(validateCaddy({ port: 8081, hash: FIXTURE_HASH, user: 'a"b' }).user, 'quote in user invalid')
}

// --- token boundaries ----------------------------------------------------------
{
  // Zero TTL.
  const zero = createToken(0, NOW)
  assertEqual(zero.exp, NOW, 'zero ttl exp == now')
  assert(!isTokenValid(zero, NOW), 'zero ttl token invalid at now')
  assert(isTokenValid(zero, NOW - 1), 'zero ttl token valid one ms before')

  // Fractional TTL.
  const half = createToken(0.5, NOW)
  assertEqual(half.exp, NOW + 1_800_000, 'half-hour ttl exact')

  // Huge TTL.
  const huge = createToken(24 * 365 * 10, NOW)
  assertEqual(huge.exp, NOW + 10 * 365 * 24 * 3_600_000, '10-year ttl exact')

  // Non-integer / string exp.
  assert(!isTokenValid({ v: 'x', exp: '1700000000000' }, NOW), 'string exp invalid')
  assert(!isTokenValid({ v: 'x', exp: 1.5 }, NOW), 'float exp invalid')

  // Far-future expiry is valid.
  assert(isTokenValid(JSON.parse('{"v":"a","exp":99999999999999}'), NOW), 'exp far future valid')
}

// --- audit boundaries ------------------------------------------------------------
{
  assertEqual(normalizeHostname('example.com:443'), 'example.com', 'host:port stripped')
  assertEqual(normalizeHostname('[2001:db8::1]:8080'), '2001:db8::1', 'bracketed ipv6 stripped')
  assertEqual(normalizeHostname('::1'), '::1', 'bare ipv6 preserved')
  assertEqual(normalizeHostname(''), '', 'empty hostname')
  assertEqual(normalizeHostname('   '), '', 'whitespace hostname')

  assert(!isTunnelHostname(''), 'empty not tunnel')
  assert(!isTunnelHostname('192.168.0.1'), 'LAN not tunnel')
  assert(!isTunnelHostname('10.0.0.1'), 'private not tunnel')
  assert(isTunnelHostname('foo.cloudflared.example'), 'cloudflared fragment')
  assert(isTunnelHostname('x.tunnel.mycompany.com'), 'tunnel fragment')

  // env hints: null/undefined values skipped.
  assertDeep(collectEnvHints({}), [], 'no env hints when empty')
  assertDeep(collectEnvHints({ HOME: '/Users/x' }), [], 'HOME not a tunnel hint')
  assertDeep(collectEnvHints({ CLOUDFLARED_TUNNEL_ID: '' }), [], 'empty value skipped')
  assert(collectEnvHints({ FRP_SERVER_ADDR: '1.2.3.4:7000' }).includes('FRP_SERVER_ADDR'), 'frp detected')
  assert(collectEnvHints({ tunnel_secret: 'x' }).includes('tunnel_secret'), 'generic tunnel key detected')
}

// --- bcrypt boundaries -------------------------------------------------------------
{
  // Empty password is hashable by bcrypt but meaningless — reject at caller level.
  assert(await verifyPassword('', FIXTURE_HASH) === false, 'empty password never matches')

  // Very long passwords (bcrypt truncates at 72 bytes).
  const long = 'x'.repeat(200)
  const h = await hashPassword(long, 4)
  assert(await verifyPassword(long, h), '200-char password roundtrips')

  // Unicode.
  const unicode = '密码🔐1234'
  const hu = await hashPassword(unicode, 4)
  assert(await verifyPassword(unicode, hu), 'unicode password roundtrips')

  // clampRounds boundaries.
  assertEqual(clampRounds(-10), 4, 'negative rounds clamped to min')
  assertEqual(clampRounds(0), 4, 'zero rounds clamped to min')
  assertEqual(clampRounds(31), 31, '31 kept')
  assertEqual(clampRounds(32), 31, '32 clamped to max')
  assertEqual(clampRounds(12.0), 12, 'whole float kept')
  assertEqual(clampRounds(12.9), 12, 'float truncated down')
}

// --- caddy throw boundaries ---------------------------------------------------------
{
  assertThrows(() => buildCaddyfile({ port: 'x', hash: FIXTURE_HASH }), 'bad port throws')
  assertThrows(() => buildCaddyfile({ port: 8081, hash: '' }), 'empty hash throws')
  assertThrows(() => buildCaddyfile({ port: 8081, hash: 'x', backend: 'nope' }), 'bad backend throws')
}

function assertDeep(actual, expected, message) {
  assert(JSON.stringify(actual) === JSON.stringify(expected), message)
}

summary('boundary')
