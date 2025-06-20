#!/bin/sh
set -e

pnpm run prepare
pnpm run lint
pnpm run tsc