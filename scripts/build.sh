#!/bin/bash
# Build: compile src/ → lib/ with tsdown (host ESM + client browser bundle).
# No DSH_CHECKOUT required — peerDependencies resolve from this package's own
# node_modules (or the profile's, when junction-linked).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Prefer a local tsdown; fall back to a global one.
if [ -x node_modules/.bin/tsdown ]; then
  TSDOWN=node_modules/.bin/tsdown
elif [ -x node_modules/.bin/tsdown.cmd ]; then
  TSDOWN=node_modules/.bin/tsdown.cmd
else
  TSDOWN=tsdown
fi

echo "=== Building with tsdown ==="
"$TSDOWN" --config ./tsdown.config.ts
echo "=== Build complete (lib/index.js + lib/client.js) ==="
