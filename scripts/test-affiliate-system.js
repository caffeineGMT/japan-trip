#!/usr/bin/env node

/**
 * Test Affiliate Click Tracking System
 * Verifies API endpoint and tracking functionality
 */

const testEndpoint = process.argv[2] || 'http://localhost:3000';

async function testAffiliateTracking() {
  console.log('🧪 Affiliate Click Tracking Test Suite\n');
  console.log(`Testing endpoint: ${testEndpoint}/api/track-affiliate-click\n`);

  const testCases = [
    {
      name: 'Booking.com Hotel Click',
      payload: {
        provider: 'booking.com',
        location: 'Senso-ji Temple',
        city: 'Tokyo',
        url: 'https://www.booking.com/searchresults.html?aid=demo_booking_2891748&ss=Tokyo',
        timestamp: new Date().toISOString(),
      },
    },
    {
      name: 'Klook Activity Click',
      payload: {
        provider: 'klook',
        location: 'Tokyo Skytree',
        city: 'Tokyo',
        url: 'https://www.klook.com/activity/tokyo-skytree?aid=demo_klook_5678',
        timestamp: new Date().toISOString(),
      },
    },
    {
      name: 'JR Pass Click',
      payload: {
        provider: 'jrpass',
        location: 'JR Pass',
        city: 'Japan',
        url: 'https://www.jrpass.com/buy?affiliate=demo_jrpass_abc',
        timestamp: new Date().toISOString(),
      },
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of testCases) {
    try {
      console.log(`📝 Test: ${test.name}`);
      console.log(`   Provider: ${test.payload.provider}`);
      console.log(`   Location: ${test.payload.location}`);
      console.log(`   City: ${test.payload.city}`);

      const response = await fetch(`${testEndpoint}/api/track-affiliate-click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(test.payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log(`   ✅ PASS - Click tracked successfully`);
        if (data.clickId) {
          console.log(`   Click ID: ${data.clickId}`);
        }
        passed++;
      } else {
        console.log(`   ❌ FAIL - ${data.error || 'Unknown error'}`);
        failed++;
      }
    } catch (error) {
      console.log(`   ❌ FAIL - ${error.message}`);
      failed++;
    }
    console.log('');
  }

  console.log('📊 Test Results:');
  console.log(`   ✅ Passed: ${passed}/${testCases.length}`);
  if (failed > 0) {
    console.log(`   ❌ Failed: ${failed}/${testCases.length}`);
  }
  console.log(`   Success Rate: ${((passed / testCases.length) * 100).toFixed(0)}%`);

  if (passed === testCases.length) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Check logs above.');
    process.exit(1);
  }
}

// Handle fetch for Node.js < 18
if (typeof fetch === 'undefined') {
  const nodeFetch = require('node-fetch');
  global.fetch = nodeFetch;
}

testAffiliateTracking().catch((error) => {
  console.error('❌ Test suite crashed:', error);
  process.exit(1);
});
