# Testing Quick Start Guide

## 🚀 Run Tests NOW

### Option 1: Full Smoke Test (Recommended)
```bash
npm run test:smoke
```

This will:
- ✅ Auto-start test server if needed
- ✅ Run all 75+ tests
- ✅ Verify critical features
- ✅ Generate coverage report
- ✅ Clean up after completion

**Expected time**: 30-60 seconds

### Option 2: Individual Test Suites

```bash
# Fast unit tests (2-3 seconds)
npm run test:unit

# Integration tests (5-8 seconds)
npm run test:integration

# E2E tests (20-30 seconds)
npm run test:e2e
```

### Option 3: Watch Mode (Development)
```bash
npm run test:watch
```

Auto-reruns tests when files change.

## 📋 What Gets Tested

### ✅ Core Features (100% Coverage)
- Map loading and Leaflet initialization
- Navigation between pages
- Language switching (EN, ZH, JA)
- Weather widget with caching
- Offline mode / PWA functionality
- Service worker registration
- Packing checklist persistence
- Japanese phrases modal
- Responsive design (mobile/tablet/desktop)

### 📊 Test Count by Category
- **Unit Tests**: 27
- **Integration Tests**: 8
- **E2E Tests**: 40
- **Total**: 75+

## 🔍 Verify Installation

```bash
# Check dependencies installed
npm list jest puppeteer --depth=0

# Expected output:
# japan-trip@1.0.0
# ├── jest@30.3.0
# └── puppeteer@24.39.1
```

## 🐛 Troubleshooting

### Server Already Running
```bash
# Kill existing server
pkill -f "node server.js"

# Then run tests
npm run test:smoke
```

### Port 3001 In Use
```bash
# Change port
export PORT=3002
npm run test:smoke
```

### Puppeteer Installation Issues
```bash
# Reinstall Puppeteer with Chromium
npm install puppeteer --force
```

### Tests Failing
```bash
# Run with verbose output
npm test -- --verbose

# Run single test file
npm test -- tests/unit/i18n.test.js
```

## 📈 Coverage Report

```bash
# Generate HTML coverage report
npm run test:coverage

# View in browser (macOS)
open coverage/lcov-report/index.html

# View in browser (Linux)
xdg-open coverage/lcov-report/index.html
```

## ✅ Pre-Deploy Checklist

Before pushing to production:

```bash
# 1. Run smoke tests
npm run test:smoke

# 2. Check no uncommitted changes
git status

# 3. Deploy to Vercel
npx vercel --prod --yes
```

## 🎯 Quick Test Validation

Run this to verify tests are working:

```bash
# Should pass instantly
npm run test:unit -- tests/unit/i18n.test.js

# Expected output:
# PASS  tests/unit/i18n.test.js
#   I18N Module
#     Initialization
#       ✓ should default to English
#       ✓ should load saved language from localStorage
#       ...
# Tests: 15 passed, 15 total
```

## 📚 Full Documentation

See `tests/README.md` for comprehensive documentation.

---

**Need Help?**
- Check `tests/README.md` for detailed docs
- View `QA_TEST_SUMMARY.md` for implementation details
- Run `npm test -- --help` for Jest options
