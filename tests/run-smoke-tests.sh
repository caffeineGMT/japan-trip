#!/bin/bash

# Comprehensive Smoke Test Runner
# Runs Playwright tests across Chromium, Firefox, and WebKit
# Exits with code 1 if any tests fail
# Target: <60s execution time

set -e  # Exit on error

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Japan Trip Companion - Smoke Test Suite"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track test results
TOTAL_FAILURES=0
START_TIME=$(date +%s)

# Test server configuration
TEST_URL="${TEST_URL:-http://localhost:3001}"
SERVER_PID=""

# Function to cleanup on exit
cleanup() {
  if [ -n "$SERVER_PID" ]; then
    echo ""
    echo -e "${BLUE}▶${NC} Cleaning up test server (PID: $SERVER_PID)..."
    kill $SERVER_PID 2>/dev/null || true
    wait $SERVER_PID 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

# Check if server is running, start if needed
echo -e "${BLUE}▶${NC} Checking test server..."
if ! curl -s "$TEST_URL" > /dev/null 2>&1; then
  echo -e "${YELLOW}⚠${NC}  Server not running. Starting server on port 3001..."
  export NODE_ENV=test
  export PORT=3001
  npm start > /tmp/japan-trip-test-server.log 2>&1 &
  SERVER_PID=$!

  # Wait for server to be ready (max 30 seconds)
  echo "   Waiting for server to start..."
  for i in {1..30}; do
    if curl -s "$TEST_URL" > /dev/null 2>&1; then
      echo -e "${GREEN}✓${NC}  Server is ready (PID: $SERVER_PID)"
      break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
      echo -e "${RED}✗${NC}  Server failed to start after 30 seconds"
      echo "   Check logs at: /tmp/japan-trip-test-server.log"
      exit 1
    fi
  done
else
  echo -e "${GREEN}✓${NC}  Server is already running at $TEST_URL"
fi

echo ""

# Install Playwright browsers if needed
echo -e "${BLUE}▶${NC} Checking Playwright browsers..."
if ! npx playwright --version > /dev/null 2>&1; then
  echo -e "${YELLOW}⚠${NC}  Playwright not found. Installing..."
  npm install -D @playwright/test
fi

# Check if browsers are installed
if [ ! -d "$HOME/.cache/ms-playwright" ] && [ ! -d "$HOME/Library/Caches/ms-playwright" ]; then
  echo -e "${YELLOW}⚠${NC}  Installing Playwright browsers (one-time setup)..."
  npx playwright install --with-deps chromium firefox webkit
else
  echo -e "${GREEN}✓${NC}  Playwright browsers installed"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Running tests across 3 browsers..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Array of browsers to test
BROWSERS=("chromium" "firefox" "webkit")

# Run tests for each browser
for BROWSER in "${BROWSERS[@]}"; do
  echo -e "${BLUE}▶${NC} Testing with ${BROWSER}..."

  # Run Playwright tests for this browser
  if TEST_URL="$TEST_URL" npx playwright test tests/smoke-tests.js --project="$BROWSER" --reporter=line; then
    echo -e "${GREEN}✓${NC} ${BROWSER} tests passed"
  else
    echo -e "${RED}✗${NC} ${BROWSER} tests failed"
    TOTAL_FAILURES=$((TOTAL_FAILURES + 1))
  fi

  echo ""
done

# Calculate execution time
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check results
if [ $TOTAL_FAILURES -eq 0 ]; then
  echo -e "${GREEN}✅ ALL SMOKE TESTS PASSED!${NC}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Summary:"
  echo "  ✓ Chromium tests passed"
  echo "  ✓ Firefox tests passed"
  echo "  ✓ WebKit tests passed"
  echo "  ⏱  Total execution time: ${DURATION}s"
  echo ""

  if [ $DURATION -lt 60 ]; then
    echo -e "${GREEN}🎯 Performance target met! (<60s)${NC}"
  else
    echo -e "${YELLOW}⚠  Performance target exceeded (${DURATION}s > 60s)${NC}"
  fi

  echo ""
  echo -e "${GREEN}Ready for deployment! 🚀${NC}"
  echo ""

  exit 0
else
  echo -e "${RED}❌ SMOKE TESTS FAILED${NC}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Summary:"
  echo "  ✗ $TOTAL_FAILURES browser(s) failed tests"
  echo "  ⏱  Total execution time: ${DURATION}s"
  echo ""
  echo -e "${RED}Fix failures before deployment!${NC}"
  echo ""

  exit 1
fi
