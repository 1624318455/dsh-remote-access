# Tests

| Suite | File | Covers |
| --- | --- | --- |
| Smoke | `tests/smoke.mjs` | Build artifacts exist & fresh; host loads & registers both API routes; client bundle has the ModuleLoader banner, `inject` incl. `slots`, and the two known-slot registrations (the exact regexes the super-injector gate checks); package.json / cordis.patch.yml well-formed; client bundle executes under a ModuleLoader shim |
| Client load | `tests/client-load.mjs` | Simulates the browser boot: loads the real `lib/client.js` via a ModuleLoader + react stub, runs `apply()` with stubbed slots/settingsScope/connection/remote, asserts both slots register |
| Unit | `tests/unit.mjs` | Pure logic: Caddyfile/commands/validation, token create/validate/expiry, audit classification, bcrypt hash/verify/rounds, 72-byte truncation |
| Boundary | `tests/boundary.mjs` | Adversarial edges: port 0/-1/65536/NaN/3080-collision, bcrypt alphabet/length, backend/user validation, token TTL 0/fractional/huge, IPv6 hostname normalization, env-hint scanning |
| Scenario | `tests/scenario.mjs` | Full user flows with fakes (settings scope + localStorage + host API): lock lifecycle (enable → reload → locked → wrong pwd → right pwd → token → reload unlocked → clear → locked), hash+Caddy generator flow, audit danger/safe flows, scope loading/unavailable, token expiry re-lock |

Run everything: `npm test` (248 assertions).

Tests import the TypeScript sources directly via Node 24 native type stripping — no build output required except the smoke/client-load suites, which validate `lib/`.
