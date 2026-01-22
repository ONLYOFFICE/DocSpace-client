#!/bin/bash
set -e

# E2E Test Runner Entrypoint
# This script runs Playwright tests for specified packages based on environment variables
# 
# Environment variables:
#   RUN_CLIENT=true      - Run client e2e tests
#   RUN_LOGIN=true       - Run login e2e tests
#   RUN_DOCEDITOR=true   - Run doceditor e2e tests
#   RUN_SDK=true         - Run sdk e2e tests
#   RUN_MANAGEMENT=true  - Run management e2e tests

echo "🎭 E2E Test Runner"
echo "===================="

# Track overall exit code and results
EXIT_CODE=0
TESTS_RUN=0
PASSED_TESTS=""
FAILED_TESTS=""

# Create directories for test artifacts
mkdir -p /app/playwright-report
mkdir -p /app/test-results

# Function to collect test artifacts from a package
collect_artifacts() {
    local package=$1
    local pkg_dir="/app/packages/$package"
    
    # Copy playwright report if exists
    if [ -d "$pkg_dir/playwright-report" ]; then
        mkdir -p "/app/playwright-report/$package"
        cp -r "$pkg_dir/playwright-report/"* "/app/playwright-report/$package/" 2>/dev/null || true
    fi
    
    # Copy test results if exists
    if [ -d "$pkg_dir/test-results" ]; then
        mkdir -p "/app/test-results/$package"
        cp -r "$pkg_dir/test-results/"* "/app/test-results/$package/" 2>/dev/null || true
    fi
}

# Run Client tests
if [ "${RUN_CLIENT}" = "true" ]; then
    echo ""
    echo "📦 Running Client e2e tests..."
    echo "------------------------------"
    cd /app/packages/client
    if pnpm exec playwright test; then
        echo "✅ Client tests passed"
        PASSED_TESTS="$PASSED_TESTS Client"
    else
        echo "❌ Client tests failed"
        FAILED_TESTS="$FAILED_TESTS Client"
        EXIT_CODE=1
    fi
    collect_artifacts "client"
    TESTS_RUN=$((TESTS_RUN + 1))
fi

# Run Login tests
if [ "${RUN_LOGIN}" = "true" ]; then
    echo ""
    echo "📦 Running Login e2e tests..."
    echo "-----------------------------"
    cd /app/packages/login
    if pnpm exec playwright test; then
        echo "✅ Login tests passed"
        PASSED_TESTS="$PASSED_TESTS Login"
    else
        echo "❌ Login tests failed"
        FAILED_TESTS="$FAILED_TESTS Login"
        EXIT_CODE=1
    fi
    collect_artifacts "login"
    TESTS_RUN=$((TESTS_RUN + 1))
fi

# Run Doceditor tests
if [ "${RUN_DOCEDITOR}" = "true" ]; then
    echo ""
    echo "📦 Running Doceditor e2e tests..."
    echo "---------------------------------"
    cd /app/packages/doceditor
    if pnpm exec playwright test; then
        echo "✅ Doceditor tests passed"
        PASSED_TESTS="$PASSED_TESTS Doceditor"
    else
        echo "❌ Doceditor tests failed"
        FAILED_TESTS="$FAILED_TESTS Doceditor"
        EXIT_CODE=1
    fi
    collect_artifacts "doceditor"
    TESTS_RUN=$((TESTS_RUN + 1))
fi

# Run SDK tests
if [ "${RUN_SDK}" = "true" ]; then
    echo ""
    echo "📦 Running SDK e2e tests..."
    echo "---------------------------"
    cd /app/packages/sdk
    if pnpm exec playwright test; then
        echo "✅ SDK tests passed"
        PASSED_TESTS="$PASSED_TESTS SDK"
    else
        echo "❌ SDK tests failed"
        FAILED_TESTS="$FAILED_TESTS SDK"
        EXIT_CODE=1
    fi
    collect_artifacts "sdk"
    TESTS_RUN=$((TESTS_RUN + 1))
fi

# Run Management tests
if [ "${RUN_MANAGEMENT}" = "true" ]; then
    echo ""
    echo "📦 Running Management e2e tests..."
    echo "----------------------------------"
    cd /app/packages/management
    if pnpm exec playwright test; then
        echo "✅ Management tests passed"
        PASSED_TESTS="$PASSED_TESTS Management"
    else
        echo "❌ Management tests failed"
        FAILED_TESTS="$FAILED_TESTS Management"
        EXIT_CODE=1
    fi
    collect_artifacts "management"
    TESTS_RUN=$((TESTS_RUN + 1))
fi

echo ""
echo "===================="
echo "🏁 Test Summary"
echo "===================="
echo "Tests run: $TESTS_RUN"

if [ $TESTS_RUN -eq 0 ]; then
    echo "⚠️  No tests were selected to run"
    echo "Set RUN_CLIENT, RUN_LOGIN, RUN_DOCEDITOR, RUN_SDK, or RUN_MANAGEMENT to 'true'"
    exit 1
fi

if [ -n "$PASSED_TESTS" ]; then
    echo "✅ Passed:$PASSED_TESTS"
fi

if [ -n "$FAILED_TESTS" ]; then
    echo "❌ Failed:$FAILED_TESTS"
fi

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ All tests passed!"
else
    echo "❌ Some tests failed"
    echo ""
    echo "View reports:"
    echo "  pnpm exec playwright show-report playwright-report/<package>"
    echo ""
    echo "View traces:"
    echo "  pnpm exec playwright show-trace test-results/<package>/<test>/trace.zip"
fi

exit $EXIT_CODE
