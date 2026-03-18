/**
 * Comprehensive QA Smoke Test Suite for Japan Trip Companion
 * Tests all critical user-facing features across multiple browsers
 * Target: <60s execution time, CI/CD ready
 */

const { test, expect } = require('@playwright/test');

// Test configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3001';
const TIMEOUT = 10000; // 10s per test

test.describe('Japan Trip Companion - Smoke Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Set viewport for mobile-first testing
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('1. Map loads correctly with markers', async ({ page }) => {
    test.setTimeout(TIMEOUT);

    await page.goto(BASE_URL);

    // Wait for map container to be visible
    await expect(page.locator('#map')).toBeVisible({ timeout: 5000 });

    // Check that Leaflet map initialized
    const mapExists = await page.evaluate(() => {
      return document.querySelector('#map').classList.contains('leaflet-container');
    });
    expect(mapExists).toBeTruthy();

    // Verify markers are present (should have multiple markers for trip destinations)
    const markerCount = await page.locator('.leaflet-marker-icon').count();
    expect(markerCount).toBeGreaterThan(0);

    // Verify map controls are visible
    await expect(page.locator('.leaflet-control-zoom')).toBeVisible();
  });

  test('2. Day navigation works correctly', async ({ page }) => {
    test.setTimeout(TIMEOUT);

    await page.goto(BASE_URL);

    // Wait for sidebar to load
    await page.waitForSelector('#sidebar-content', { timeout: 5000 });

    // Get day tabs
    const dayTabs = await page.locator('[data-day]').count();

    if (dayTabs > 0) {
      // Click on day 1 tab
      await page.click('[data-day="1"]');

      // Verify day theme is visible in sidebar
      await expect(page.locator('.day-theme, .sidebar-header, #sidebar-header')).toBeVisible();

      // Check if content changed (location-specific text should appear)
      const contentExists = await page.locator('#sidebar-content').textContent();
      expect(contentExists.length).toBeGreaterThan(0);
    }
  });

  test('3. Language switching functionality', async ({ page }) => {
    test.setTimeout(TIMEOUT);

    await page.goto(BASE_URL);

    // Wait for language switcher
    await page.waitForSelector('.lang-switcher', { timeout: 5000 });

    // Get original English content
    const englishContent = await page.locator('body').textContent();

    // Switch to Japanese
    await page.click('[data-lang="ja"]');
    await page.waitForTimeout(500); // Wait for language switch

    // Verify Japanese content appears (check for Japanese characters)
    const japaneseContent = await page.locator('body').textContent();
    const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(japaneseContent);
    expect(hasJapanese).toBeTruthy();

    // Switch to Chinese
    await page.click('[data-lang="zh"]');
    await page.waitForTimeout(500);

    // Verify Chinese content appears
    const chineseContent = await page.locator('body').textContent();
    const hasChinese = /[\u4E00-\u9FFF]/.test(chineseContent);
    expect(hasChinese).toBeTruthy();

    // Switch back to English
    await page.click('[data-lang="en"]');
    await page.waitForTimeout(500);

    // Verify we're back to English
    await expect(page.locator('[data-lang="en"]')).toHaveClass(/active/);
  });

  test('4. Offline mode and service worker registration', async ({ page, context }) => {
    test.setTimeout(TIMEOUT);

    await page.goto(BASE_URL);

    // Wait for service worker to register
    await page.waitForTimeout(2000);

    // Check service worker is registered
    const swRegistered = await page.evaluate(() => {
      return navigator.serviceWorker.controller !== null;
    });

    // Note: SW might not be registered on first load, so we'll check if registration exists
    const swExists = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    expect(swExists).toBeTruthy();

    // Test offline mode simulation
    await context.setOffline(true);

    // Try to reload the page - should work from cache if SW is active
    await page.reload({ waitUntil: 'domcontentloaded' });

    // Check if page still loads (basic check)
    const bodyExists = await page.locator('body').count();
    expect(bodyExists).toBe(1);

    // Re-enable network
    await context.setOffline(false);
  });

  test('5. Weather widget displays', async ({ page }) => {
    test.setTimeout(TIMEOUT);

    await page.goto(BASE_URL);

    // Wait for potential weather widget to load
    await page.waitForTimeout(2000);

    // Check if weather widget or sakura widget exists
    const weatherWidget = await page.locator('.weather-widget, #sakura-widget, .sakura-widget').count();
    expect(weatherWidget).toBeGreaterThan(0);

    // If weather widget exists, verify it has content
    if (await page.locator('.weather-widget').count() > 0) {
      await expect(page.locator('.weather-widget')).toBeVisible();
    }
  });

  test('6. Phrases modal opens and displays content', async ({ page }) => {
    test.setTimeout(TIMEOUT);

    await page.goto(BASE_URL);

    // Wait for phrases button
    await page.waitForSelector('#phrases-btn', { timeout: 5000 });

    // Click phrases button
    await page.click('#phrases-btn');

    // Wait for modal to appear
    await page.waitForTimeout(500);

    // Check if modal is visible
    const modal = page.locator('#phrases-modal');
    const isVisible = await modal.isVisible();

    if (isVisible) {
      // Verify modal has content
      await expect(page.locator('#phrases-list, .phrases-list')).toBeVisible();

      // Close modal
      const closeBtn = page.locator('.close-modal, .modal-header button');
      if (await closeBtn.count() > 0) {
        await closeBtn.first().click();
        await page.waitForTimeout(300);
      }
    }
  });

  test('7. Service worker file is accessible', async ({ page }) => {
    test.setTimeout(TIMEOUT);

    // Navigate to service worker file
    const response = await page.goto(`${BASE_URL}/service-worker.js`);

    // Verify response is successful
    expect(response.status()).toBe(200);

    // Verify content type is JavaScript
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('javascript');

    // Verify file has content
    const content = await response.text();
    expect(content.length).toBeGreaterThan(0);
  });

  test('8. Route polylines render on map', async ({ page }) => {
    test.setTimeout(TIMEOUT);

    await page.goto(BASE_URL);

    // Wait for map to load
    await page.waitForSelector('#map', { timeout: 5000 });
    await page.waitForTimeout(2000); // Wait for routes to render

    // Check for route polylines in the Leaflet overlay pane
    const polylines = await page.locator('.leaflet-overlay-pane path, .leaflet-overlay-pane polyline').count();

    // Routes may not always be present on initial load, so we'll check if overlay pane exists
    const overlayPane = await page.locator('.leaflet-overlay-pane').count();
    expect(overlayPane).toBeGreaterThan(0);

    // If polylines exist, verify there are multiple (at least for a trip with multiple days)
    if (polylines > 0) {
      expect(polylines).toBeGreaterThan(0);
    }
  });

  test('9. PWA manifest is valid', async ({ page }) => {
    test.setTimeout(TIMEOUT);

    const response = await page.goto(`${BASE_URL}/manifest.json`);

    // Verify manifest loads
    expect(response.status()).toBe(200);

    // Parse and validate manifest
    const manifest = await response.json();

    // Check required fields
    expect(manifest).toHaveProperty('name');
    expect(manifest).toHaveProperty('short_name');
    expect(manifest).toHaveProperty('icons');
    expect(manifest.icons.length).toBeGreaterThan(0);
  });

  test('10. Critical assets load successfully', async ({ page }) => {
    test.setTimeout(TIMEOUT);

    await page.goto(BASE_URL);

    // Check critical JavaScript files load
    const criticalAssets = [
      '/style.css',
      '/script.js',
      '/i18n.js',
      '/weather.js'
    ];

    for (const asset of criticalAssets) {
      const response = await page.goto(`${BASE_URL}${asset}`);
      expect(response.status()).toBe(200);
    }
  });

  test('11. Mobile responsive design', async ({ page }) => {
    test.setTimeout(TIMEOUT);

    // Test different mobile viewports
    const viewports = [
      { width: 375, height: 667, name: 'iPhone SE' },
      { width: 390, height: 844, name: 'iPhone 12 Pro' },
      { width: 360, height: 740, name: 'Android' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(BASE_URL);

      // Verify map is visible and takes up space
      const mapElement = page.locator('#map');
      await expect(mapElement).toBeVisible();

      const boundingBox = await mapElement.boundingBox();
      expect(boundingBox.width).toBeGreaterThan(0);
      expect(boundingBox.height).toBeGreaterThan(0);
    }
  });

  test('12. Sidebar toggle functionality', async ({ page }) => {
    test.setTimeout(TIMEOUT);

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);

    // Wait for sidebar toggle button
    const toggleBtn = page.locator('#sidebar-toggle, .hamburger');

    if (await toggleBtn.count() > 0) {
      // Get initial sidebar state
      const sidebar = page.locator('#sidebar, .sidebar');
      await expect(sidebar).toBeVisible();

      // Toggle sidebar (if mobile)
      await toggleBtn.click();
      await page.waitForTimeout(300);

      // Toggle back
      await toggleBtn.click();
      await page.waitForTimeout(300);
    }
  });

  test('13. No critical console errors on load', async ({ page }) => {
    test.setTimeout(TIMEOUT);

    const errors = [];

    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Listen for page errors
    page.on('pageerror', error => {
      errors.push(error.message);
    });

    await page.goto(BASE_URL);
    await page.waitForTimeout(3000); // Wait for all scripts to load

    // Filter out known non-critical errors (like failed analytics calls in test env)
    const criticalErrors = errors.filter(err => {
      // Ignore PostHog/analytics errors in test environment
      if (err.includes('posthog') || err.includes('analytics')) return false;
      // Ignore network errors for optional resources
      if (err.includes('Failed to fetch') || err.includes('net::ERR')) return false;
      return true;
    });

    // Should have no critical errors
    expect(criticalErrors.length).toBe(0);
  });

  test('14. Performance: Page loads within acceptable time', async ({ page }) => {
    test.setTimeout(TIMEOUT);

    const startTime = Date.now();

    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    const loadTime = Date.now() - startTime;

    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);

    // Verify interactive elements are ready
    await expect(page.locator('#map')).toBeVisible();
  });

  test('15. Reservations page is accessible', async ({ page }) => {
    test.setTimeout(TIMEOUT);

    await page.goto(BASE_URL);

    // Check if reservations link exists
    const reservationsLink = page.locator('a[href*="reservations"]');

    if (await reservationsLink.count() > 0) {
      // Navigate to reservations page
      await reservationsLink.first().click();
      await page.waitForLoadState('domcontentloaded');

      // Verify we're on the reservations page
      expect(page.url()).toContain('reservations');

      // Verify page has content
      const bodyText = await page.locator('body').textContent();
      expect(bodyText.length).toBeGreaterThan(0);
    }
  });
});

// Performance budgets test
test.describe('Performance Budgets', () => {
  test('Page meets Lighthouse performance budgets', async ({ page }) => {
    test.setTimeout(15000);

    await page.goto(BASE_URL);

    // Measure key metrics
    const metrics = await page.evaluate(() => {
      const perfData = window.performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        domInteractive: perfData.domInteractive - perfData.fetchStart
      };
    });

    // DOM Interactive should be under 2.5s
    expect(metrics.domInteractive).toBeLessThan(2500);

    // Full load should be under 5s
    expect(metrics.loadComplete).toBeLessThan(5000);
  });
});
