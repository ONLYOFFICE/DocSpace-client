#!/bin/bash
# Benchmark script for measuring client build time
# Usage: bash scripts/benchmark-build.sh [runs]
# Example: bash scripts/benchmark-build.sh 3

RUNS=${1:-1}
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
CLIENT_DIR="$ROOT_DIR/packages/client"
RESULTS_FILE="$ROOT_DIR/benchmark-results.txt"

# Detect bundler
if grep -q '"vite"' "$CLIENT_DIR/package.json" 2>/dev/null && grep -q '"build".*vite' "$CLIENT_DIR/package.json" 2>/dev/null; then
  BUNDLER="vite"
elif grep -q '"webpack"' "$CLIENT_DIR/package.json" 2>/dev/null; then
  BUNDLER="webpack"
else
  BUNDLER="unknown"
fi

BRANCH=$(git -C "$ROOT_DIR" branch --show-current 2>/dev/null || echo "unknown")
NODE_VER=$(node -v 2>/dev/null || echo "unknown")
PNPM_VER=$(pnpm -v 2>/dev/null || echo "unknown")
OS_INFO=$(uname -ms)
CPU_INFO=""
if [[ "$(uname)" == "Darwin" ]]; then
  CPU_INFO=$(sysctl -n machdep.cpu.brand_string 2>/dev/null || echo "unknown")
  MEM_GB=$(( $(sysctl -n hw.memsize 2>/dev/null || echo 0) / 1073741824 ))
else
  CPU_INFO=$(grep -m1 'model name' /proc/cpuinfo 2>/dev/null | cut -d: -f2 | xargs || echo "unknown")
  MEM_GB=$(( $(grep MemTotal /proc/meminfo 2>/dev/null | awk '{print $2}') / 1048576 ))
fi

echo "========================================"
echo " DocSpace Client Build Benchmark"
echo "========================================"
echo " Branch:  $BRANCH"
echo " Bundler: $BUNDLER"
echo " Node:    $NODE_VER"
echo " pnpm:    $PNPM_VER"
echo " OS:      $OS_INFO"
echo " CPU:     $CPU_INFO"
echo " RAM:     ${MEM_GB}GB"
echo " Runs:    $RUNS"
echo "========================================"
echo ""

TIMES=()
TOTAL=0
PREP_TIME_MS=0

# Run prerequisite steps once before benchmarking
echo "Preparing prerequisites..."
PREP_START=$(python3 -c 'import time; print(int(time.time()*1000))')
PREP_LOG=$(mktemp)
PREP_STEP=0

# 1) Generate runtime.json (webpack only, before-build.js)
if [ "$BUNDLER" = "webpack" ] && [ -f "$ROOT_DIR/common/scripts/before-build.js" ]; then
  PREP_STEP=$((PREP_STEP + 1))
  echo "  [$PREP_STEP] before-build.js (runtime.json)..."
  (cd "$ROOT_DIR" && node common/scripts/before-build.js) >> "$PREP_LOG" 2>&1
  if [ $? -ne 0 ]; then
    echo "before-build.js FAILED:"
    cat "$PREP_LOG"
    rm -f "$PREP_LOG"
    exit 1
  fi
fi

# 2) Generate translation files (both webpack and vite)
PREP_STEP=$((PREP_STEP + 1))
echo "  [$PREP_STEP] build:translations..."
(cd "$ROOT_DIR" && pnpm --filter @docspace/client run build:translations) >> "$PREP_LOG" 2>&1
if [ $? -ne 0 ]; then
  echo "build:translations FAILED:"
  cat "$PREP_LOG"
  rm -f "$PREP_LOG"
  exit 1
fi

PREP_END=$(python3 -c 'import time; print(int(time.time()*1000))')
PREP_TIME_MS=$((PREP_END - PREP_START))
PREP_TIME_S=$(echo "scale=2; $PREP_TIME_MS / 1000" | bc)
rm -f "$PREP_LOG"
echo "Prepared in ${PREP_TIME_S}s"
echo ""

for i in $(seq 1 "$RUNS"); do
  echo "--- Run $i/$RUNS ---"

  # Clean dist
  rm -rf "$CLIENT_DIR/dist" "$CLIENT_DIR/.vite" 2>/dev/null

  # Measure build time (macOS date doesn't support %3N, use python3)
  START=$(python3 -c 'import time; print(int(time.time()*1000))')

  BUILD_LOG=$(mktemp)
  (cd "$ROOT_DIR" && pnpm --filter @docspace/client run build) > "$BUILD_LOG" 2>&1
  BUILD_EXIT=$?
  tail -5 "$BUILD_LOG"

  END=$(python3 -c 'import time; print(int(time.time()*1000))')

  if [ $BUILD_EXIT -ne 0 ]; then
    echo ""
    echo "Build FAILED (exit code $BUILD_EXIT). Full log:"
    echo "----------------------------------------"
    cat "$BUILD_LOG"
    echo "----------------------------------------"
    rm -f "$BUILD_LOG"
    exit 1
  fi
  rm -f "$BUILD_LOG"

  ELAPSED_MS=$((END - START))
  ELAPSED_S=$(echo "scale=2; $ELAPSED_MS / 1000" | bc)

  TIMES+=("$ELAPSED_MS")
  TOTAL=$((TOTAL + ELAPSED_MS))

  echo "Run $i: ${ELAPSED_S}s"
  echo ""
done

# Calculate stats
AVG_MS=$((TOTAL / RUNS))
AVG_S=$(echo "scale=2; $AVG_MS / 1000" | bc)

MIN_MS=${TIMES[0]}
MAX_MS=${TIMES[0]}
for t in "${TIMES[@]}"; do
  (( t < MIN_MS )) && MIN_MS=$t
  (( t > MAX_MS )) && MAX_MS=$t
done
MIN_S=$(echo "scale=2; $MIN_MS / 1000" | bc)
MAX_S=$(echo "scale=2; $MAX_MS / 1000" | bc)

# Dist size
DIST_SIZE="n/a"
if [ -d "$CLIENT_DIR/dist" ]; then
  DIST_SIZE=$(du -sh "$CLIENT_DIR/dist" | cut -f1)
fi

PREP_TIME_S=$(echo "scale=2; $PREP_TIME_MS / 1000" | bc)
TOTAL_WITH_PREP_MS=$((AVG_MS + PREP_TIME_MS))
TOTAL_WITH_PREP_S=$(echo "scale=2; $TOTAL_WITH_PREP_MS / 1000" | bc)

echo "========================================"
echo " Results: $BUNDLER ($BRANCH)"
echo "========================================"
echo " Prep:      ${PREP_TIME_S}s"
echo " Build avg: ${AVG_S}s"
if [ "$RUNS" -gt 1 ]; then
  echo " Build min: ${MIN_S}s"
  echo " Build max: ${MAX_S}s"
fi
echo " Total:     ${TOTAL_WITH_PREP_S}s (prep + avg build)"
echo " Dist:      $DIST_SIZE"
echo "========================================"

# Append to results file
{
  echo ""
  echo "--- $(date '+%Y-%m-%d %H:%M:%S') ---"
  echo "Branch:  $BRANCH"
  echo "Bundler: $BUNDLER"
  echo "Node:    $NODE_VER | pnpm: $PNPM_VER"
  echo "OS:      $OS_INFO | CPU: $CPU_INFO | RAM: ${MEM_GB}GB"
  echo "Prep:    ${PREP_TIME_S}s"
  echo "Runs:    $RUNS | Avg: ${AVG_S}s | Min: ${MIN_S}s | Max: ${MAX_S}s"
  echo "Total:   ${TOTAL_WITH_PREP_S}s (prep + avg build)"
  echo "Dist:    $DIST_SIZE"
} >> "$RESULTS_FILE"

echo ""
echo "Results appended to benchmark-results.txt"
