#!/bin/bash
set -e

echo "=== E2E Dev Mode ==="
echo "Rebuilding sdk dist from mounted sources..."

cd /app

# Rebuild translations (generated files overwritten by volume mount) + next build
pnpm --filter @docspace/sdk run build:translations
pnpm --filter @docspace/sdk run test:build

echo "Build complete. Running command: $@"
echo ""

cd /app/packages/sdk
exec "$@"
