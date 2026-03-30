#!/bin/bash
set -e

echo "=== E2E Dev Mode ==="
echo "Rebuilding doceditor dist from mounted sources..."

cd /app

# Rebuild translations (generated files overwritten by volume mount) + next build
pnpm --filter @docspace/doceditor run build:translations
pnpm --filter @docspace/doceditor run test:build

echo "Build complete. Running command: $@"
echo ""

cd /app/packages/doceditor
exec "$@"
