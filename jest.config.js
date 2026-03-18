// Jest configuration for Japan Trip QA tests
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  collectCoverageFrom: [
    'i18n.js',
    'weather.js',
    'script.js',
    'routes.js',
    'whats-next.js',
    'checklist.js',
    'reservations.js',
    'lib/**/*.js',
    '!node_modules/**',
    '!tests/**',
    '!dist/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 30000,
  verbose: true,
  bail: false, // Continue running tests even if some fail
  maxWorkers: '50%' // Use half of available CPU cores
};
