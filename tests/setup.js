// Test setup and global configuration
const path = require('path');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = process.env.PORT || 3001;

// Mock localStorage for Node.js environment
global.localStorage = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = String(value);
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  }
};

// Mock document for testing i18n
global.document = {
  documentElement: {
    lang: 'en'
  }
};

// Mock console to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: console.error // Keep errors visible
};

// Test timeout configuration
jest.setTimeout(30000); // 30 seconds for E2E tests
