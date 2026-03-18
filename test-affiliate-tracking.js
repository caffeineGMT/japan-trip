#!/usr/bin/env node

/**
 * Test Script for Affiliate Click Tracking
 *
 * This script sends test clicks to the API endpoint to verify:
 * 1. API endpoint is accessible
 * 2. Click data is properly formatted
 * 3. Supabase insertion succeeds
 * 4. Response is valid
 *
 * Usage:
 *   node test-affiliate-tracking.js
 *   node test-affiliate-tracking.js http://localhost:3000
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.argv[2] || 'http://localhost:3000';
const ENDPOINT = '/api/affiliate/click';

// Test cases
const testClicks = [
  {
    name: 'Booking.com Hotel Click',
    data: {
      source: 'booking.com',
      templateId: 'japan-cherry-blossom-2026',
      dayIndex: 0,
      itemName: 'Grand Hyatt Tokyo',
      itemPrice: 350,
      city: 'Tokyo',
      sessionId: 'test_session_' + Date.now()
    }
  },
  {
    name: 'GetYourGuide Activity Click',
    data: {
      source: 'getyourguide',
      templateId: 'japan-cherry-blossom-2026',
      dayIndex: 5,
      itemName: 'Kyoto: Golden Pavilion & Bamboo Forest Tour',
      itemPrice: 68,
      city: 'Kyoto',
      sessionId: 'test_session_' + Date.now()
    }
  },
  {
    name: 'JR Pass Click',
    data: {
      source: 'jrpass',
      templateId: 'japan-cherry-blossom-2026',
      dayIndex: 0,
      itemName: '14-Day JR Pass',
      itemPrice: 445,
      city: 'Tokyo',
      sessionId: 'test_session_' + Date.now()
    }
  }
];

// Helper to make POST request
function postClick(testCase) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + ENDPOINT);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const postData = JSON.stringify(testCase.data);

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Affiliate-Test-Script/1.0'
      }
    };

    const req = client.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            response: response
          });
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Run tests
async function runTests() {
  console.log('\n🧪 Affiliate Click Tracking Test Suite\n');
  console.log(`Testing endpoint: ${BASE_URL}${ENDPOINT}\n`);
  console.log('─'.repeat(60));

  let passed = 0;
  let failed = 0;

  for (const testCase of testClicks) {
    console.log(`\n📝 Test: ${testCase.name}`);
    console.log(`   Source: ${testCase.data.source}`);
    console.log(`   Item: ${testCase.data.itemName} ($${testCase.data.itemPrice})`);
    console.log(`   City: ${testCase.data.city}, Day: ${testCase.data.dayIndex}`);

    try {
      const result = await postClick(testCase);

      if (result.statusCode === 200 && result.response.success) {
        console.log(`   ✅ PASS - Click logged successfully`);
        console.log(`   Click ID: ${result.response.clickId}`);
        passed++;
      } else {
        console.log(`   ❌ FAIL - Unexpected response`);
        console.log(`   Status: ${result.statusCode}`);
        console.log(`   Response:`, result.response);
        failed++;
      }
    } catch (error) {
      console.log(`   ❌ FAIL - Request error`);
      console.log(`   Error: ${error.message}`);
      failed++;
    }

    // Wait 500ms between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '─'.repeat(60));
  console.log('\n📊 Test Results:\n');
  console.log(`   ✅ Passed: ${passed}/${testClicks.length}`);
  console.log(`   ❌ Failed: ${failed}/${testClicks.length}`);
  console.log(`   Success Rate: ${Math.round((passed / testClicks.length) * 100)}%`);
  console.log('');

  if (failed === 0) {
    console.log('🎉 All tests passed!\n');
    console.log('Next steps:');
    console.log('1. Check Supabase dashboard for logged clicks');
    console.log('2. Verify clicks appear in outbound_affiliate_clicks table');
    console.log('3. Test widgets in browser at http://localhost:3000');
    console.log('');
  } else {
    console.log('⚠️  Some tests failed. Please check:\n');
    console.log('1. Server is running at ' + BASE_URL);
    console.log('2. Supabase credentials are configured in .env');
    console.log('3. Database schema is deployed to Supabase');
    console.log('4. API endpoint /api/affiliate/click.js exists');
    console.log('');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('\n💥 Fatal error:', error.message);
  process.exit(1);
});
