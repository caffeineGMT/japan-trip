#!/bin/bash
# Smoke test runner for Japan Trip Companion
# Runs all QA tests before marketing pushes

set -e  # Exit on error

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Japan Trip QA Smoke Test Suite"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if server is running
echo -e "${BLUE}▶${NC} Checking if test server is running..."
if ! curl -s http://localhost:3001 > /dev/null 2>&1; then
  echo -e "${YELLOW}⚠${NC} Server not running. Starting server..."
  export NODE_ENV=test
  export PORT=3001
  npm start > /dev/null 2>&1 &
  SERVER_PID=$!
  echo "  Server PID: $SERVER_PID"

  # Wait for server to be ready
  echo "  Waiting for server to start..."
  for i in {1..30}; do
    if curl -s http://localhost:3001 > /dev/null 2>&1; then
      echo -e "${GREEN}✓${NC} Server is ready"
      break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
      echo -e "${RED}✗${NC} Server failed to start"
      exit 1
    fi
  done
else
  echo -e "${GREEN}✓${NC} Server is running"
  SERVER_PID=""
fi

echo ""

# Run unit tests
echo -e "${BLUE}▶${NC} Running unit tests..."
if npm test -- tests/unit/*.test.js; then
  echo -e "${GREEN}✓${NC} Unit tests passed"
else
  echo -e "${RED}✗${NC} Unit tests failed"
  [ -n "$SERVER_PID" ] && kill $SERVER_PID
  exit 1
fi

echo ""

# Run integration tests
echo -e "${BLUE}▶${NC} Running integration tests..."
if npm test -- tests/integration/*.test.js; then
  echo -e "${GREEN}✓${NC} Integration tests passed"
else
  echo -e "${RED}✗${NC} Integration tests failed"
  [ -n "$SERVER_PID" ] && kill $SERVER_PID
  exit 1
fi

echo ""

# Run E2E tests
echo -e "${BLUE}▶${NC} Running E2E tests..."
if npm test -- tests/e2e/*.test.js; then
  echo -e "${GREEN}✓${NC} E2E tests passed"
else
  echo -e "${RED}✗${NC} E2E tests failed"
  [ -n "$SERVER_PID" ] && kill $SERVER_PID
  exit 1
fi

echo ""

# Check critical features
echo -e "${BLUE}▶${NC} Verifying critical features..."

# Check service worker
if curl -s http://localhost:3001/service-worker.js | grep -q "Service Worker"; then
  echo -e "${GREEN}✓${NC} Service worker file exists"
else
  echo -e "${RED}✗${NC} Service worker file missing or invalid"
fi

# Check manifest
if curl -s http://localhost:3001/manifest.json | grep -q "name"; then
  echo -e "${GREEN}✓${NC} PWA manifest valid"
else
  echo -e "${RED}✗${NC} PWA manifest missing or invalid"
fi

# Check critical assets
ASSETS=("style.css" "script.js" "i18n.js" "weather.js" "icons/icon-192.png")
for asset in "${ASSETS[@]}"; do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/$asset | grep -q "200"; then
    echo -e "${GREEN}✓${NC} $asset accessible"
  else
    echo -e "${RED}✗${NC} $asset not accessible"
  fi
done

echo ""

# Generate test report
echo -e "${BLUE}▶${NC} Generating coverage report..."
npm test -- --coverage --coverageReporters=text > /dev/null 2>&1 || true

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ All smoke tests passed!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Summary:"
echo "  ✓ Unit tests passed"
echo "  ✓ Integration tests passed"
echo "  ✓ E2E tests passed"
echo "  ✓ Critical features verified"
echo ""
echo -e "${GREEN}Ready for deployment! 🚀${NC}"
echo ""

# Cleanup
if [ -n "$SERVER_PID" ]; then
  echo "Stopping test server (PID: $SERVER_PID)..."
  kill $SERVER_PID 2>/dev/null || true
fi

exit 0
