#!/bin/sh
# To run tests, type ./test.sh in your terminal
set -e

pnpm run prepare

pnpm run lint

pnpm run tsc