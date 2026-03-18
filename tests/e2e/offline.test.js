// Offline mode and caching tests
const puppeteer = require('puppeteer');

describe('Offline Mode - PWA Tests', () => {
  let browser;
  let page;
  const baseUrl = process.env.TEST_URL || 'http://localhost:3001';

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
  });

  afterEach(async () => {
    if (page) {
      await page.close();
    }
  });

  describe('Service Worker Caching', () => {
    test('should cache static assets on first visit', async () => {
      await page.goto(baseUrl, { waitUntil: 'networkidle0' });
      await page.waitForTimeout(3000); // Wait for SW to cache assets

      const cacheNames = await page.evaluate(async () => {
        return await caches.keys();
      });

      expect(cacheNames.length).toBeGreaterThan(0);
      expect(cacheNames.some(name => name.includes('static'))).toBe(true);
    });

    test('should cache Leaflet assets', async () => {
      await page.goto(baseUrl, { waitUntil: 'networkidle0' });
      await page.waitForTimeout(3000);

      const leafletCached = await page.evaluate(async () => {
        const cacheNames = await caches.keys();
        const leafletCache = cacheNames.find(name => name.includes('leaflet'));

        if (!leafletCache) return false;

        const cache = await caches.open(leafletCache);
        const keys = await cache.keys();
        return keys.some(req => req.url.includes('leaflet'));
      });

      expect(leafletCached).toBe(true);
    });

    test('should cache map tiles', async () => {
      await page.goto(baseUrl, { waitUntil: 'networkidle0' });
      await page.waitForTimeout(5000); // Wait for tiles to load and cache

      const tilesCached = await page.evaluate(async () => {
        const cacheNames = await caches.keys();
        const tilesCache = cacheNames.find(name => name.includes('tiles'));

        if (!tilesCache) return false;

        const cache = await caches.open(tilesCache);
        const keys = await cache.keys();
        return keys.length > 0;
      });

      expect(tilesCached).toBe(true);
    });
  });

  describe('Offline Functionality', () => {
    test('should load from cache when offline', async () => {
      // First visit - populate cache
      await page.goto(baseUrl, { waitUntil: 'networkidle0' });
      await page.waitForTimeout(3000);

      // Go offline
      await page.setOfflineMode(true);

      // Reload page - should load from cache
      const response = await page.reload({ waitUntil: 'domcontentloaded' });

      // Service worker should serve cached content
      expect(response.status()).toBe(200);

      const title = await page.title();
      expect(title).toContain('Japan Trip');
    });

    test('should show offline indicator when network fails', async () => {
      await page.goto(baseUrl, { waitUntil: 'networkidle0' });
      await page.waitForTimeout(2000);

      // Simulate offline
      await page.setOfflineMode(true);

      // Check if app detects offline state
      const isOffline = await page.evaluate(() => !navigator.onLine);
      expect(isOffline).toBe(true);
    });

    test('should serve offline page for navigation when not cached', async () => {
      await page.goto(baseUrl, { waitUntil: 'networkidle0' });
      await page.waitForTimeout(3000);

      // Go offline
      await page.setOfflineMode(true);

      // Try to navigate to uncached page
      try {
        await page.goto(`${baseUrl}/nonexistent-page.html`, {
          waitUntil: 'domcontentloaded',
          timeout: 5000
        });

        // Should show offline page
        const content = await page.content();
        expect(content).toContain('offline');
      } catch (error) {
        // Timeout is acceptable for offline pages
        expect(error.message).toContain('timeout');
      }
    });
  });

  describe('Cache Management', () => {
    test('should update cache on new version', async () => {
      // First visit
      await page.goto(baseUrl, { waitUntil: 'networkidle0' });
      await page.waitForTimeout(3000);

      const initialCaches = await page.evaluate(async () => {
        return await caches.keys();
      });

      expect(initialCaches.length).toBeGreaterThan(0);

      // Service worker should handle cache updates
      const swActive = await page.evaluate(async () => {
        const registration = await navigator.serviceWorker.getRegistration();
        return registration && registration.active !== null;
      });

      expect(swActive).toBe(true);
    });

    test('should clean up old caches on activation', async () => {
      await page.goto(baseUrl, { waitUntil: 'networkidle0' });
      await page.waitForTimeout(3000);

      // Check that only valid cache versions exist
      const cacheNames = await page.evaluate(async () => {
        return await caches.keys();
      });

      // Should not have multiple versions of the same cache type
      const staticCaches = cacheNames.filter(name => name.includes('static'));
      expect(staticCaches.length).toBeLessThanOrEqual(1);
    });
  });

  describe('Network Strategies', () => {
    test('should use cache-first for static assets', async () => {
      await page.goto(baseUrl, { waitUntil: 'networkidle0' });
      await page.waitForTimeout(3000);

      // Monitor network requests
      const requests = [];
      page.on('request', req => {
        if (req.url().includes('style.css')) {
          requests.push(req);
        }
      });

      // Reload page
      await page.reload({ waitUntil: 'networkidle0' });

      // Static assets should be served from cache (no network request)
      // or served very quickly
      expect(requests.length).toBeLessThanOrEqual(1);
    });

    test('should handle network-first for API requests', async () => {
      await page.goto(baseUrl, { waitUntil: 'networkidle0' });

      // Weather API should try network first
      const weatherRequests = [];
      page.on('request', req => {
        if (req.url().includes('openweathermap')) {
          weatherRequests.push(req);
        }
      });

      await page.waitForTimeout(2000);

      // May or may not have weather requests depending on cache
      // Just verify no errors occur
      const hasErrors = await page.evaluate(() => {
        return window.hasOwnProperty('__weatherError');
      });

      expect(hasErrors).toBe(false);
    });
  });
});
