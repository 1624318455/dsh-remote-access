/**
 * Shared fixtures + tiny assert helpers for the dsh-remote-access test suites.
 */

import { hashPassword } from '../src/lib/bcrypt.ts'

/** Deterministic, cheap bcrypt hash (4 rounds) of the fixture password. */
export const FIXTURE_PASSWORD = 'correct-horse-42'
export const FIXTURE_HASH = '$2b$04$gHd3pKGZiQrRaMOLMgTb.uXxMC3WKGJN1puwhK4blXVz4RMInZ96m'

/** Generate a fresh hash at test time (slower but self-consistent). */
export async function makeFixtureHash(password = FIXTURE_PASSWORD, rounds = 4) {
  return hashPassword(password, rounds)
}

let passed = 0
let failed = 0
const failures = []

export function assert(condition, message) {
  if (condition) {
    passed++
  } else {
    failed++
    failures.push(message)
  }
}

export function assertEqual(actual, expected, message) {
  const ok = Object.is(actual, expected)
  if (ok) {
    passed++
  } else {
    failed++
    failures.push(`${message}\n  expected: ${JSON.stringify(expected)}\n  actual:   ${JSON.stringify(actual)}`)
  }
}

export function assertDeepEqual(actual, expected, message) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  if (ok) {
    passed++
  } else {
    failed++
    failures.push(`${message}\n  expected: ${JSON.stringify(expected)}\n  actual:   ${JSON.stringify(actual)}`)
  }
}

export function assertThrows(fn, message) {
  try {
    fn()
    failed++
    failures.push(`${message} (no throw)`)
  } catch {
    passed++
  }
}

export function summary(suite) {
  console.log(`[${suite}] ${passed} passed, ${failed} failed`)
  if (failures.length > 0) {
    console.log('Failures:')
    for (const f of failures) console.log('  ✗ ' + f)
  }
  if (failed > 0) process.exitCode = 1
}
