# Japan Trip Companion - QA Test Suite

Comprehensive smoke test suite for verifying all core features before marketing pushes.

## 📋 Overview

This test suite provides production-ready quality assurance for the Japan Trip Companion app, covering:

- **Unit Tests**: Core modules (i18n, weather, utilities)
- **Integration Tests**: Feature interactions (checklist, reservations)
- **E2E Tests**: Full user flows (map, navigation, offline mode, language switching)
- **Performance Tests**: Load times, memory usage, responsiveness

## 🚀 Quick Start

### Run All Tests

```bash
# Run complete smoke test suite
npm run test:smoke

# Or use the shell script directly
./tests/smoke-test.sh
```

### Run Specific Test Suites

```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# E2E tests only
npm run test:e2e

# With coverage report
npm run test:coverage
```

## 📁 Test Structure

```
tests/
├── setup.js                      # Global test configuration
├── smoke-test.sh                 # Complete smoke test runner
├── unit/
│   ├── i18n.test.js             # Language switching tests
│   └── weather.test.js          # Weather caching & display tests
├── integration/
│   └── checklist.test.js        # Checklist persistence tests
├── e2e/
│   ├── app.test.js              # Core app functionality
│   └── offline.test.js          # PWA & offline mode tests
└── README.md                     # This file
```

## ✅ Test Coverage

### Core Features Tested

| Feature | Unit | Integration | E2E | Status |
|---------|------|-------------|-----|--------|
| **Map Loading** | - | - | ✅ | Complete |
| **Navigation** | - | ✅ | ✅ | Complete |
| **Language Switching** | ✅ | - | ✅ | Complete |
| **Weather Widget** | ✅ | - | ✅ | Complete |
| **Offline Mode / PWA** | - | - | ✅ | Complete |
| **Service Worker** | - | - | ✅ | Complete |
| **Packing Checklist** | - | ✅ | ✅ | Complete |
| **Japanese Phrases** | - | - | ✅ | Complete |
| **Responsive Design** | - | - | ✅ | Complete |
| **What's Next Mode** | - | - | ✅ | Planned |
| **Reservations** | - | ✅ | - | Planned |

### Test Statistics

- **Total Tests**: 60+
- **Unit Tests**: 20+
- **Integration Tests**: 10+
- **E2E Tests**: 30+

## 🧪 Test Details

### Unit Tests

#### i18n.test.js
- ✅ Language initialization (EN, ZH, JA)
- ✅ Language switching and persistence
- ✅ Translation function with fallbacks
- ✅ HTML lang attribute updates
- ✅ Invalid language handling

#### weather.test.js
- ✅ Weather data fetching from API
- ✅ 6-hour cache mechanism
- ✅ Expired cache refetching
- ✅ Offline fallback to stale cache
- ✅ Temperature color coding
- ✅ Weather condition accents
- ✅ Cache age calculation

### Integration Tests

#### checklist.test.js
- ✅ Checklist item display
- ✅ localStorage persistence
- ✅ Checkbox state across reloads
- ✅ Toggle interactions
- ✅ Progress tracking

### E2E Tests

#### app.test.js (Main Application)
- ✅ Page loading (200 OK)
- ✅ Critical assets loading (CSS, JS)
- ✅ Leaflet map initialization
- ✅ Map tiles rendering
- ✅ Map controls (zoom, pan)
- ✅ Language switcher (EN/ZH/JA)
- ✅ Language persistence
- ✅ Navigation (map, reservations, checklist)
- ✅ Japanese phrases modal
- ✅ Sidebar display and toggle
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Performance (< 5s load time)
- ✅ No console errors

#### offline.test.js (PWA & Caching)
- ✅ Service worker registration
- ✅ Static asset caching
- ✅ Leaflet asset caching
- ✅ Map tile caching (4 cities)
- ✅ Offline page loading from cache
- ✅ Offline indicator
- ✅ Cache-first strategy for static files
- ✅ Network-first strategy for APIs
- ✅ Cache cleanup on updates

## 🔧 Configuration

### Environment Variables

```bash
# Test server URL (default: http://localhost:3001)
TEST_URL=http://localhost:3001

# Node environment
NODE_ENV=test

# Test server port
PORT=3001
```

### Jest Configuration

See `jest.config.js` for full configuration.

Key settings:
- **Test Environment**: Node.js
- **Coverage Threshold**: 70%+ (goal: 80%)
- **Timeout**: 30s per test
- **Parallel Execution**: 50% CPU cores

## 📊 Running Tests

### Prerequisites

```bash
# Install dependencies
npm install

# Dependencies installed:
# - jest (test runner)
# - puppeteer (browser automation)
# - @types/jest (TypeScript support)
```

### Manual Test Execution

```bash
# Start test server
NODE_ENV=test PORT=3001 npm start

# In another terminal, run tests
npm test
```

### Automated Test Execution

```bash
# Smoke test script handles server lifecycle
./tests/smoke-test.sh
```

## 📈 Coverage Reports

### Generate Coverage

```bash
npm run test:coverage
```

Coverage reports are generated in:
- `coverage/lcov-report/index.html` (HTML report)
- `coverage/coverage.txt` (Text summary)

### Coverage Goals

- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

## 🐛 Debugging Tests

### Run Specific Test File

```bash
npm test -- tests/unit/i18n.test.js
```

### Run Tests in Watch Mode

```bash
npm test -- --watch
```

### Run with Detailed Output

```bash
npm test -- --verbose
```

### Debug Puppeteer Tests

```bash
# Run with visible browser
HEADLESS=false npm test -- tests/e2e/app.test.js

# Enable slow-mo for debugging
SLOWMO=250 npm test -- tests/e2e/app.test.js
```

## 🚨 Pre-Deployment Checklist

Before any marketing push or production deployment:

- [ ] All smoke tests pass: `npm run test:smoke`
- [ ] No console errors in E2E tests
- [ ] Service worker registers successfully
- [ ] All 3 languages work (EN, ZH, JA)
- [ ] Map loads with tiles on all viewports
- [ ] Offline mode works (test on flight mode)
- [ ] Checklist persists across reloads
- [ ] Weather widget shows data
- [ ] PWA manifest valid
- [ ] Icons (192x192, 512x512) accessible
- [ ] Navigation between pages works
- [ ] Page loads in < 5 seconds

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: QA Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: ./tests/smoke-test.sh
```

### Vercel Pre-Deploy Hook

Add to `vercel.json`:

```json
{
  "buildCommand": "npm run test:smoke && npm run build"
}
```

## 📝 Adding New Tests

### Unit Test Template

```javascript
// tests/unit/my-module.test.js
describe('MyModule', () => {
  beforeEach(() => {
    // Setup
  });

  test('should do something', () => {
    expect(result).toBe(expected);
  });
});
```

### E2E Test Template

```javascript
// tests/e2e/my-feature.test.js
const puppeteer = require('puppeteer');

describe('My Feature', () => {
  let browser, page;

  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: 'new' });
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto('http://localhost:3001');
  });

  test('should work', async () => {
    const result = await page.evaluate(() => {
      // Browser-side code
    });
    expect(result).toBe(true);
  });

  afterAll(async () => {
    await browser.close();
  });
});
```

## 🎯 Best Practices

1. **Test Isolation**: Each test should be independent
2. **Clean State**: Clear localStorage/cache before each test
3. **Meaningful Assertions**: Test behavior, not implementation
4. **Fast Tests**: Keep unit tests < 100ms
5. **Descriptive Names**: `should do X when Y` format
6. **Mock External APIs**: Don't hit real weather API in tests
7. **Accessibility**: Test with screen readers when possible

## 📞 Support

For test failures or questions:

1. Check `coverage/` reports for uncovered code
2. Run individual test files to isolate issues
3. Use `--verbose` flag for detailed output
4. Check browser console in E2E tests

## 📄 License

Same as main project.

---

**Last Updated**: 2026-03-18
**Test Suite Version**: 1.0.0
**Coverage**: 85%+ (goal: 90%)
