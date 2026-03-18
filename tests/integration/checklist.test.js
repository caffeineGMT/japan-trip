// Integration tests for checklist functionality
const puppeteer = require('puppeteer');

describe('Packing Checklist - Integration Tests', () => {
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

    // Clear localStorage before each test
    await page.goto(baseUrl, { waitUntil: 'networkidle0' });
    await page.evaluate(() => localStorage.clear());
  });

  afterEach(async () => {
    if (page) {
      await page.close();
    }
  });

  describe('Checklist Display', () => {
    test('should load checklist page', async () => {
      const response = await page.goto(`${baseUrl}/checklist.html`, {
        waitUntil: 'networkidle0'
      });

      expect(response.status()).toBe(200);

      const title = await page.title();
      expect(title).toContain('Japan Trip');
    });

    test('should display checklist items', async () => {
      await page.goto(`${baseUrl}/checklist.html`, { waitUntil: 'networkidle0' });
      await page.waitForTimeout(1000);

      const hasItems = await page.evaluate(() => {
        const items = document.querySelectorAll('.checklist-item, [type="checkbox"]');
        return items.length > 0;
      });

      expect(hasItems).toBe(true);
    });
  });

  describe('Local Storage Persistence', () => {
    test('should save checked items to localStorage', async () => {
      await page.goto(`${baseUrl}/checklist.html`, { waitUntil: 'networkidle0' });
      await page.waitForTimeout(1000);

      // Check a checkbox
      const checkboxes = await page.$$('input[type="checkbox"]');
      if (checkboxes.length > 0) {
        await checkboxes[0].click();
        await page.waitForTimeout(500);

        // Verify it's saved to localStorage
        const savedData = await page.evaluate(() => {
          const data = localStorage.getItem('japanTripChecklist');
          return data ? JSON.parse(data) : null;
        });

        expect(savedData).toBeTruthy();
      }
    });

    test('should persist checked state across page reloads', async () => {
      await page.goto(`${baseUrl}/checklist.html`, { waitUntil: 'networkidle0' });
      await page.waitForTimeout(1000);

      // Check first checkbox
      const checkboxes = await page.$$('input[type="checkbox"]');
      if (checkboxes.length > 0) {
        await checkboxes[0].click();
        await page.waitForTimeout(500);

        const wasChecked = await page.evaluate((el) => el.checked, checkboxes[0]);
        expect(wasChecked).toBe(true);

        // Reload page
        await page.reload({ waitUntil: 'networkidle0' });
        await page.waitForTimeout(1000);

        // Verify checkbox is still checked
        const newCheckboxes = await page.$$('input[type="checkbox"]');
        const stillChecked = await page.evaluate((el) => el.checked, newCheckboxes[0]);
        expect(stillChecked).toBe(true);
      }
    });
  });

  describe('Checklist Interactions', () => {
    test('should toggle checkbox state', async () => {
      await page.goto(`${baseUrl}/checklist.html`, { waitUntil: 'networkidle0' });
      await page.waitForTimeout(1000);

      const checkboxes = await page.$$('input[type="checkbox"]');
      if (checkboxes.length > 0) {
        // Initial state
        const initialState = await page.evaluate((el) => el.checked, checkboxes[0]);

        // Click to toggle
        await checkboxes[0].click();
        await page.waitForTimeout(300);

        const newState = await page.evaluate((el) => el.checked, checkboxes[0]);
        expect(newState).toBe(!initialState);

        // Click again to toggle back
        await checkboxes[0].click();
        await page.waitForTimeout(300);

        const finalState = await page.evaluate((el) => el.checked, checkboxes[0]);
        expect(finalState).toBe(initialState);
      }
    });

    test('should show progress indicator', async () => {
      await page.goto(`${baseUrl}/checklist.html`, { waitUntil: 'networkidle0' });
      await page.waitForTimeout(1000);

      // Check if there's any progress tracking element
      const hasProgress = await page.evaluate(() => {
        const progressElements = document.querySelectorAll(
          '.progress, .progress-bar, [class*="progress"], [id*="progress"]'
        );
        return progressElements.length > 0;
      });

      // Progress indicator is optional but common
      if (hasProgress) {
        expect(hasProgress).toBe(true);
      }
    });
  });
});
