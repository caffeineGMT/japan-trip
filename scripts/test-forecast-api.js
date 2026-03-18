/**
 * Test Cherry Blossom Forecast API
 * Verifies that the API endpoint works correctly
 */

const handler = require('../api/forecast/index');

// Mock request and response objects
class MockRequest {
  constructor(query = {}) {
    this.method = 'GET';
    this.query = query;
  }
}

class MockResponse {
  constructor() {
    this.statusCode = 200;
    this.headers = {};
    this.body = null;
  }

  status(code) {
    this.statusCode = code;
    return this;
  }

  setHeader(key, value) {
    this.headers[key] = value;
  }

  json(data) {
    this.body = data;
    console.log('\nAPI Response:');
    console.log('─'.repeat(80));
    console.log(`Status: ${this.statusCode}`);
    console.log(`Headers:`, this.headers);
    console.log(`Body:`, JSON.stringify(data, null, 2));
    console.log('─'.repeat(80));
  }

  end() {
    console.log('Response ended');
  }
}

async function testAPI() {
  console.log('🌸 Testing Cherry Blossom Forecast API\n');

  // Test 1: Tokyo forecast
  console.log('Test 1: Get forecast for Tokyo');
  const req1 = new MockRequest({ city: 'Tokyo', year: '2026' });
  const res1 = new MockResponse();
  await handler(req1, res1);

  // Test 2: Kyoto forecast
  console.log('\n\nTest 2: Get forecast for Kyoto');
  const req2 = new MockRequest({ city: 'Kyoto', year: '2026' });
  const res2 = new MockResponse();
  await handler(req2, res2);

  // Test 3: Missing city parameter
  console.log('\n\nTest 3: Missing city parameter (should fail)');
  const req3 = new MockRequest({});
  const res3 = new MockResponse();
  await handler(req3, res3);

  // Test 4: Invalid city
  console.log('\n\nTest 4: Invalid city (should fail)');
  const req4 = new MockRequest({ city: 'InvalidCity' });
  const res4 = new MockResponse();
  await handler(req4, res4);

  console.log('\n✅ All tests completed!\n');
}

// Run tests
if (require.main === module) {
  testAPI().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}

module.exports = { testAPI };
