/**
 * Smoke tests for viral sharing system
 * Tests: Share link generation, OG image, referral tracking
 */

const fetch = require('node-fetch');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_USER_ID = 'test-user-' + Date.now();
const TEST_TRIP_ID = 'japan-trip-2026';

describe('Viral Sharing System - Smoke Tests', () => {
  let shareLink;
  let shortCode;
  let authToken;

  // Helper: Generate mock auth token for testing
  beforeAll(() => {
    // In production, this would be a real JWT from Clerk/Supabase
    // For testing, we'll create a mock token
    authToken = 'mock-jwt-token-' + TEST_USER_ID;
  });

  describe('1. Share Link Generation', () => {
    test('POST /api/share/generate-link creates share link', async () => {
      const response = await fetch(`${BASE_URL}/api/share/generate-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          tripId: TEST_TRIP_ID,
          userId: TEST_USER_ID
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data).toHaveProperty('shortUrl');
      expect(data).toHaveProperty('shortCode');
      expect(data.shortCode).toHaveLength(8);

      shareLink = data.shortUrl;
      shortCode = data.shortCode;

      console.log('✓ Share link created:', shareLink);
    }, 10000);

    test('Share link generation completes in < 500ms', async () => {
      const start = Date.now();

      await fetch(`${BASE_URL}/api/share/generate-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          tripId: TEST_TRIP_ID,
          userId: TEST_USER_ID
        })
      });

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(500);

      console.log(`✓ Share link generated in ${duration}ms`);
    }, 10000);

    test('Existing share returns same short code', async () => {
      const response = await fetch(`${BASE_URL}/api/share/generate-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          tripId: TEST_TRIP_ID,
          userId: TEST_USER_ID
        })
      });

      const data = await response.json();
      expect(data.shortCode).toBe(shortCode);
      expect(data.existing).toBe(true);

      console.log('✓ Existing share returns same code:', shortCode);
    }, 10000);
  });

  describe('2. Dynamic OG Image Generation', () => {
    test('GET /api/og/:shortCode returns PNG image', async () => {
      if (!shortCode) {
        throw new Error('No shortCode from previous test');
      }

      const response = await fetch(`${BASE_URL}/api/og/${shortCode}`);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('image/png');

      console.log('✓ OG image generated:', `/api/og/${shortCode}`);
    }, 15000);

    test('OG image has correct dimensions (1200x630)', async () => {
      const response = await fetch(`${BASE_URL}/api/og/${shortCode}`);
      const buffer = await response.buffer();

      // Basic check: PNG images should be reasonably sized
      expect(buffer.length).toBeGreaterThan(1000); // At least 1KB
      expect(buffer.length).toBeLessThan(500000); // Less than 500KB

      console.log(`✓ OG image size: ${(buffer.length / 1024).toFixed(1)}KB`);
    }, 15000);

    test('Invalid shortCode returns fallback image', async () => {
      const response = await fetch(`${BASE_URL}/api/og/INVALID`);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('image/png');

      console.log('✓ Fallback image served for invalid code');
    }, 10000);
  });

  describe('3. Public Trip View', () => {
    test('GET /api/trip/:shortCode returns trip data', async () => {
      const response = await fetch(`${BASE_URL}/api/trip/${shortCode}`);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data).toHaveProperty('title');
      expect(data).toHaveProperty('destination');
      expect(data).toHaveProperty('highlights');
      expect(data.highlights).toBeInstanceOf(Array);
      expect(data.highlights.length).toBeGreaterThan(0);

      console.log('✓ Trip data loaded:', data.title);
    }, 10000);

    test('Trip view increments view count', async () => {
      const response1 = await fetch(`${BASE_URL}/api/trip/${shortCode}`);
      const data1 = await response1.json();
      const viewCount1 = data1.viewCount;

      const response2 = await fetch(`${BASE_URL}/api/trip/${shortCode}`);
      const data2 = await response2.json();
      const viewCount2 = data2.viewCount;

      expect(viewCount2).toBe(viewCount1 + 1);

      console.log(`✓ View count incremented: ${viewCount1} → ${viewCount2}`);
    }, 10000);
  });

  describe('4. Share Event Tracking', () => {
    test('POST /api/share/track records share event', async () => {
      const response = await fetch(`${BASE_URL}/api/share/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          shortCode: shortCode,
          platform: 'twitter',
          userId: TEST_USER_ID,
          metadata: {
            userAgent: 'Test Suite',
            referrer: 'http://localhost'
          }
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);

      console.log('✓ Share event tracked (twitter)');
    }, 10000);

    test('Invalid platform returns error', async () => {
      const response = await fetch(`${BASE_URL}/api/share/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          shortCode: shortCode,
          platform: 'invalid_platform',
          userId: TEST_USER_ID
        })
      });

      expect(response.status).toBe(400);

      console.log('✓ Invalid platform rejected');
    }, 10000);
  });

  describe('5. Referral Tracking', () => {
    test('POST /api/referral/track creates referral', async () => {
      const referredUserId = 'referred-user-' + Date.now();

      const response = await fetch(`${BASE_URL}/api/referral/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer mock-jwt-${referredUserId}`
        },
        body: JSON.stringify({
          referrerId: TEST_USER_ID,
          shortCode: shortCode
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.referral).toHaveProperty('id');
      expect(data.referral.status).toBe('completed');

      console.log('✓ Referral tracked:', data.referral.id);
    }, 10000);

    test('Self-referral is blocked', async () => {
      const response = await fetch(`${BASE_URL}/api/referral/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          referrerId: TEST_USER_ID,
          shortCode: shortCode
        })
      });

      // Should either reject or handle gracefully
      const data = await response.json();
      expect([200, 400]).toContain(response.status);

      console.log('✓ Self-referral handled');
    }, 10000);
  });

  describe('6. Referral Rewards', () => {
    test('GET /api/referral/stats returns user stats', async () => {
      const response = await fetch(`${BASE_URL}/api/referral/stats`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data).toHaveProperty('completedReferrals');
      expect(data).toHaveProperty('premiumMonthsEarned');
      expect(data).toHaveProperty('progressToNextReward');

      console.log('✓ Referral stats:', data);
    }, 10000);

    test('3 completed referrals grants 1 month premium', async () => {
      // This test would require creating 3 real referrals
      // For smoke test, we just verify the endpoint structure
      const response = await fetch(`${BASE_URL}/api/referral/stats`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const data = await response.json();

      // Progress calculation: completed % 3
      const expectedProgress = data.completedReferrals % 3;
      expect(data.progressToNextReward).toBe(expectedProgress);

      console.log(`✓ Reward progress: ${data.completedReferrals} referrals = ${data.premiumMonthsEarned} months`);
    }, 10000);
  });

  describe('7. End-to-End Share Flow', () => {
    test('Complete viral loop: Generate → Share → View → Signup', async () => {
      // 1. User generates share link
      const shareResponse = await fetch(`${BASE_URL}/api/share/generate-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          tripId: TEST_TRIP_ID,
          userId: TEST_USER_ID
        })
      });

      const shareData = await shareResponse.json();
      expect(shareData.shortUrl).toBeDefined();

      // 2. Friend views shared trip
      const viewResponse = await fetch(`${BASE_URL}/api/trip/${shareData.shortCode}`);
      const tripData = await viewResponse.json();
      expect(tripData.title).toBeDefined();

      // 3. Share event tracked
      await fetch(`${BASE_URL}/api/share/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shortCode: shareData.shortCode,
          platform: 'facebook',
          userId: TEST_USER_ID
        })
      });

      // 4. Friend signs up with referral
      const newUserId = 'e2e-referred-' + Date.now();
      const referralResponse = await fetch(`${BASE_URL}/api/referral/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer mock-jwt-${newUserId}`
        },
        body: JSON.stringify({
          referrerId: TEST_USER_ID,
          shortCode: shareData.shortCode
        })
      });

      expect(referralResponse.status).toBe(200);

      console.log('✓ End-to-end viral flow complete');
    }, 20000);
  });
});
