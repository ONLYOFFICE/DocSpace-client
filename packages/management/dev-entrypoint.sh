#!/bin/bash
set -e

echo "=== E2E Dev Mode ==="
echo "Rebuilding management dist from mounted sources..."

cd /app

# Rebuild translations (generated files overwritten by volume mount) + next build
pnpm --filter @docspace/management run build:translations
pnpm --filter @docspace/management run test:build

echo "Build complete. Running command: $@"
echo ""

cd /app/packages/management
exec "$@"
