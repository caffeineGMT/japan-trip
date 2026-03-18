// End-to-end tests using Puppeteer
const puppeteer = require('puppeteer');
const path = require('path');

describe('Japan Trip Companion - E2E Tests', () => {
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

    // Enable console logging from browser
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Browser console error:', msg.text());
      }
    });
  });

  afterEach(async () => {
    if (page) {
      await page.close();
    }
  });

  describe('Page Loading', () => {
    test('should load the main page successfully', async () => {
      const response = await page.goto(baseUrl, { waitUntil: 'networkidle0' });
      expect(response.status()).toBe(200);

      const title = await page.title();
      expect(title).toContain('Japan Trip');
    });

    test('should load all critical assets', async () => {
      await page.goto(baseUrl, { waitUntil: 'networkidle0' });

      // Check that CSS is loaded
      const styles = await page.evaluate(() => {
        const el = document.querySelector('body');
        return window.getComputedStyle(el).margin;
      });
      expect(styles).toBeTruthy();

      // Check that JavaScript is loaded
      const hasI18N = await page.evaluate(() => typeof I18N !== 'undefined');
      expect(hasI18N).toBe(true);
    });

    test('should show header and navigation', async () => {
      await page.goto(baseUrl, { waitUntil: 'networkidle0' });

      const header = await page.$('#top-header');
      expect(header).toBeTruthy();

      const navLinks = await page.$$('.top-nav a');
      expect(navLinks.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Map Functionality', () => {
    test('should initialize Leaflet map', async () => {
      await page.goto(baseUrl, { waitUntil: 'networkidle0' });
      await page.waitForSelector('#map', { timeout: 5000 });

      const mapExists = await page.evaluate(() => {
        const mapEl = document.getElementById('map');
        return mapEl && mapEl._leaflet_id !== undefined;
      });

      expect(mapExists).toBe(true);
    });

    test('should display map tiles', async () => {
      await page.goto(baseUrl, { waitUntil: 'networkidle0' });
      await page.waitForSelector('.leaflet-tile-pane', { timeout: 5000 });

      const tilesLoaded = await page.evaluate(() => {
        const tiles = document.querySelectorAll('.leaflet-tile');
        return tiles.length > 0;
      });

      expect(tilesLoaded).toBe(true);
    });

    test('should have map controls', async () => {
      await page.goto(baseUrl, { waitUntil: 'networkidle0' });

      const zoomControls = await page.$('.leaflet-control-zoom');
      expect(zoomControls).toBeTruthy();
    });
  });

  describe('Language Switching', () => {
    test('should have all language buttons', async () => {
      await page.goto(baseUrl, { waitUntil: 'networkidle0' });

      const langButtons = await page.$$('.lang-switcher button');
      expect(langButtons.length).toBe(3);

      const langs = await Promise.all(
        langButtons.map(btn => page.evaluate(el => el.dataset.lang, btn))
      );
      expect(langs).toEqual(['en', 'zh', 'ja']);
    });

    test('should switch to Chinese', async () => {
      await page.goto(baseUrl, { waitUntil: 'networkidle0' });

      await page.click('[data-lang="zh"]');
      await page.waitForTimeout(500);

      const currentLang = await page.evaluate(() => I18N.currentLang);
      expect(currentLang).toBe('zh');

      const htmlLang = await page.evaluate(() => document.documentElement.lang);
      expect(htmlLang).toBe('zh-CN');
    });

    test('should switch to Japanese', async () => {
      await page.goto(baseUrl, { waitUntil: 'networkidle0' });

      await page.click('[data-lang="ja"]');
      await page.waitForTimeout(500);

      const currentLang = await page.evaluate(() => I18N.currentLang);
      expect(currentLang).toBe('ja');

      const htmlLang = await page.evaluate(() => document.documentElement.lang);
      expect(htmlLang).toBe('ja-JP');
    });

    test('should persist language selection', async () => {
      await page.goto(baseUrl, { waitUntil: 'networkidle0' });

      await page.click('[data-lang="zh"]');
      await page.waitForTimeout(500);

      // Reload page
      await page.reload({ waitUntil: 'networkidle0' });

      const currentLang = await page.evaluate(() => I18N.currentLang);
      expect(currentLang).toBe('zh');
    });
  });

  describe('Service Worker / PWA', () => {
    test('should register service worker', async () => {
      await page.goto(baseUrl, { waitUntil: 'networkidle0' });
      await page.waitForTimeout(2000); // Wait for SW registration

      const swRegistered = await page.evaluate(async () => {
        const registration = await navigator.serviceWorker.getRegistration();
        return registration !== undefined;
      });

      expect(swRegistered).toBe(true);
    });

    test('should have manifest.json', async () => {
      const manifestUrl = `${baseUrl}/manifest.json`;
      const manifestPage = await browser.newPage();
      const response = await manifestPage.goto(manifestUrl);

      expect(response.status()).toBe(200);

      const manifest = await response.json();
      expect(manifest.name).toBeTruthy();
      expect(manifest.icons).toBeTruthy();

      await manifestPage.close();
    });

    test('should have PWA icons', async () => {
      const icon192 = await page.goto(`${baseUrl}/icons/icon-192.png`);
      expect(icon192.status()).toBe(200);

      const icon512 = await page.goto(`${baseUrl}/icons/icon-512.png`);
      expect(icon512.status()).toBe(200);
    });
  });

  describe('Navigation', () => {
    test('should navigate to reservations page', async () => {
      await page.goto(baseUrl, { waitUntil: 'networkidle0' });

      await page.click('a[href="/reservations.html"]');
      await page.waitForNavigation({ waitUntil: 'networkidle0' });

      const url = page.url();
      expect(url).toContain('reservations.html');
    });

    test('should navigate to checklist page', async () => {
      await page.goto(baseUrl, { waitUntil: 'networkidle0' });

      await page.click('a[href="/checklist.html"]');
      await page.waitForNavigation({ waitUntil: 'networkidle0' });

      const url = page.url();
      expect(url).toContain('checklist.html');
    });
  });

  describe('Japanese Phrases Modal', () => {
    test('should open phrases modal', async () => {
      await page.goto(baseUrl, { waitUntil: 'networkidle0' });

      await page.click('#phrases-btn');
      await page.waitForTimeout(300);

      const modalVisible = await page.evaluate(() => {
        const modal = document.getElementById('phrases-modal');
        return modal && window.getComputedStyle(modal).display !== 'none';
      });

      expect(modalVisible).toBe(true);
    });

    test('should close phrases modal', async () => {
      await page.goto(baseUrl, { waitUntil: 'networkidle0' });

      await page.click('#phrases-btn');
      await page.waitForTimeout(300);

      await page.click('.close-modal');
      await page.waitForTimeout(300);

      const modalVisible = await page.evaluate(() => {
        const modal = document.getElementById('phrases-modal');
        return modal && window.getComputedStyle(modal).display !== 'none';
      });

      expect(modalVisible).toBe(false);
    });
  });

  describe('Sidebar and Day Tabs', () => {
    test('should have sidebar', async () => {
      await page.goto(baseUrl, { waitUntil: 'networkidle0' });

      const sidebar = await page.$('#sidebar');
      expect(sidebar).toBeTruthy();
    });

    test('should toggle sidebar on mobile', async () => {
      await page.setViewport({ width: 375, height: 667 }); // Mobile size
      await page.goto(baseUrl, { waitUntil: 'networkidle0' });

      const sidebarToggle = await page.$('#sidebar-toggle');
      expect(sidebarToggle).toBeTruthy();

      await page.click('#sidebar-toggle');
      await page.waitForTimeout(300);

      const sidebarVisible = await page.evaluate(() => {
        const sidebar = document.getElementById('sidebar');
        return sidebar.classList.contains('open') ||
               window.getComputedStyle(sidebar).transform !== 'none';
      });

      expect(sidebarVisible).toBe(true);
    });
  });

  describe('Responsive Design', () => {
    test('should work on mobile viewport', async () => {
      await page.setViewport({ width: 375, height: 667 });
      const response = await page.goto(baseUrl, { waitUntil: 'networkidle0' });

      expect(response.status()).toBe(200);

      const hamburgerVisible = await page.evaluate(() => {
        const hamburger = document.getElementById('sidebar-toggle');
        return hamburger && window.getComputedStyle(hamburger).display !== 'none';
      });

      expect(hamburgerVisible).toBe(true);
    });

    test('should work on tablet viewport', async () => {
      await page.setViewport({ width: 768, height: 1024 });
      const response = await page.goto(baseUrl, { waitUntil: 'networkidle0' });

      expect(response.status()).toBe(200);
    });

    test('should work on desktop viewport', async () => {
      await page.setViewport({ width: 1920, height: 1080 });
      const response = await page.goto(baseUrl, { waitUntil: 'networkidle0' });

      expect(response.status()).toBe(200);
    });
  });

  describe('Performance', () => {
    test('should load page within acceptable time', async () => {
      const startTime = Date.now();
      await page.goto(baseUrl, { waitUntil: 'networkidle0' });
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(5000); // 5 seconds
    });

    test('should not have console errors', async () => {
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.goto(baseUrl, { waitUntil: 'networkidle0' });
      await page.waitForTimeout(2000);

      expect(errors.length).toBe(0);
    });
  });
});
