/**
 * Jest Configuration for AdoptMe Backend
 * Configured for Node.js with CommonJS modules
 */

module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/', '__tests__'],
  coverageReporters: ['text', 'lcov', 'json', 'html', 'text-summary'],
  testMatch: ['**/__tests__/**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/'],
  transformIgnorePatterns: ['/node_modules/'],
  moduleFileExtensions: ['js', 'json'],
  testTimeout: 30000,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/backend/__tests__/globalSetup.js'],
  collectCoverageFrom: [
    'backend/**/*.js',
    '!backend/node_modules/**',
    '!backend/coverage/**',
    '!backend/server.js',
    '!backend/__tests__/**',
    '!backend/config/cloudinary.js',
    '!backend/config/db.js'
  ],
  rootDir: '.',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/backend/$1'
  },
  watchPathIgnorePatterns: ['/node_modules/', '/coverage/', '/dist/']
};
