# Smoke Test Suite Documentation

## Overview

Comprehensive QA smoke test suite for Japan Trip Companion app using Playwright. Tests all critical user-facing features across multiple browsers to ensure production readiness.

## Test Coverage

The smoke test suite includes **16 comprehensive tests** covering:

### Core Features
1. **Map Loading** - Verifies Leaflet map initializes with markers
2. **Day Navigation** - Tests day-by-day itinerary navigation
3. **Language Switching** - Validates trilingual support (EN/中文/日本語)
4. **Offline Mode** - Tests service worker and offline functionality
5. **Weather Widget** - Verifies weather/sakura widget displays
6. **Phrases Modal** - Tests Japanese phrases modal functionality

### Technical Features
7. **Service Worker** - Validates SW file accessibility and registration
8. **Route Polylines** - Checks map route rendering
9. **PWA Manifest** - Validates manifest.json structure
10. **Critical Assets** - Verifies CSS/JS files load correctly
11. **Mobile Responsive** - Tests across multiple viewport sizes
12. **Sidebar Toggle** - Validates mobile navigation
13. **Console Errors** - Checks for critical JavaScript errors
14. **Performance** - Measures page load time (<5s target)
15. **Navigation** - Tests reservations page accessibility
16. **Performance Budgets** - Validates Lighthouse metrics

## Running Tests

### Quick Start

```bash
# Run smoke tests across all 3 browsers
npm run test:smoke:playwright

# Or run directly
./tests/run-smoke-tests.sh
```

### Individual Browser Testing

```bash
# Test with Chromium only
TEST_URL=http://localhost:3001 npx playwright test --project=chromium

# Test with Firefox only
TEST_URL=http://localhost:3001 npx playwright test --project=firefox

# Test with WebKit (Safari) only
TEST_URL=http://localhost:3001 npx playwright test --project=webkit
```

### Custom Test URL

```bash
# Test against production
TEST_URL=https://your-production-url.com ./tests/run-smoke-tests.sh

# Test against staging
TEST_URL=https://staging.example.com npm run test:smoke:playwright
```

## Test Execution

### Performance Target
- **Target execution time:** <60 seconds for all browsers
- **Browser coverage:** Chromium, Firefox, WebKit (Safari)
- **Viewport testing:** Desktop (1280x720) and Mobile (375x667)

### Exit Codes
- `0` - All tests passed ✅
- `1` - One or more tests failed ❌

## CI/CD Integration

The smoke test suite is designed for CI/CD pipelines:

### GitHub Actions Example

```yaml
name: Smoke Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm start &
      - run: sleep 5
      - run: ./tests/run-smoke-tests.sh
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: test-results
          path: test-results/
```

## Test Results

Test results are saved to:
- **HTML Report:** `test-results/html/index.html`
- **JSON Report:** `test-results/results.json`
- **Screenshots:** `test-results/` (on failure)
- **Videos:** `test-results/` (on failure)

View the HTML report:
```bash
npx playwright show-report test-results/html
```

## Requirements

### Dependencies
- **@playwright/test** (installed as dev dependency)
- **Node.js** 16+ recommended
- **Browsers:** Chromium, Firefox, WebKit (auto-installed)

### Server Setup
Tests require the app server running on `http://localhost:3001` (or custom TEST_URL).

The test runner will automatically:
1. Check if server is running
2. Start server if needed (PORT=3001)
3. Wait for server to be ready
4. Run tests
5. Clean up server on exit

## Debugging Failed Tests

### Run with UI Mode
```bash
npx playwright test --ui
```

### Run in headed mode
```bash
npx playwright test --headed
```

### Run specific test
```bash
npx playwright test -g "Map loads correctly"
```

### Debug mode
```bash
npx playwright test --debug
```

### View trace
```bash
npx playwright show-trace test-results/trace.zip
```

## Test Maintenance

### Adding New Tests

1. Add test to `tests/smoke-tests.js`
2. Follow existing test structure:
   ```javascript
   test('Test name', async ({ page }) => {
     test.setTimeout(TIMEOUT);
     // Your test code
   });
   ```

3. Run locally to verify:
   ```bash
   ./tests/run-smoke-tests.sh
   ```

### Updating Tests

When app features change:
1. Update corresponding test in `smoke-tests.js`
2. Update selectors if UI changed
3. Adjust timeouts if needed
4. Run full test suite to verify

### Performance Optimization

If tests exceed 60s target:
- Run tests in parallel (increase `workers` in config)
- Reduce `waitForTimeout` calls
- Use more specific selectors
- Optimize test server startup

## Best Practices

1. **Test Independence** - Each test should run independently
2. **Realistic Data** - Use production-like data and scenarios
3. **Clear Assertions** - Each test should have clear pass/fail criteria
4. **Error Handling** - Tests handle both success and error states
5. **Mobile-First** - Tests prioritize mobile viewports
6. **Performance** - Tests validate performance budgets
7. **CI-Ready** - Tests work in headless CI environments

## Acceptance Criteria

✅ All 16 tests pass across 3 browsers
✅ Test suite completes in <60 seconds
✅ CI/CD integration ready
✅ Mobile and desktop viewports tested
✅ Performance budgets validated
✅ No critical console errors
✅ PWA features verified
✅ Offline mode tested

## Support

For issues or questions:
- Check test results in `test-results/html/index.html`
- Review server logs at `/tmp/japan-trip-test-server.log`
- Run with `--debug` flag for step-by-step debugging
- Check Playwright docs: https://playwright.dev
