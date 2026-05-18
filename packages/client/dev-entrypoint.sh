#!/bin/bash
set -e

echo "=== E2E Dev Mode ==="
echo "Rebuilding client dist from mounted sources..."

cd /app

# Rebuild translations + vite build
pnpm --filter @docspace/client run test:build

echo "Build complete. Running command: $@"
echo ""

cd /app/packages/client
exec "$@"
