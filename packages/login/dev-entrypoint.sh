#!/bin/bash
set -e

echo "=== E2E Dev Mode ==="
echo "Rebuilding login dist from mounted sources..."

cd /app

# Rebuild translations (generated files overwritten by volume mount) + next build
pnpm --filter @docspace/login run build:translations
pnpm --filter @docspace/login run test:build

echo "Build complete. Running command: $@"
echo ""

cd /app/packages/login
exec "$@"
