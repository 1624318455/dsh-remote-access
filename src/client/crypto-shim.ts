/**
 * Browser crypto shim for bcryptjs's Node-fallback import.
 *
 * bcryptjs imports `node:crypto` as a fallback RNG source and only reaches it
 * when the Web Crypto API is absent. In the browser bundle that import must
 * resolve to something harmless — this empty stub satisfies module resolution
 * while `globalThis.crypto.getRandomValues` (always present in modern
 * browsers) remains the actual source of randomness.
 */
export default {}
