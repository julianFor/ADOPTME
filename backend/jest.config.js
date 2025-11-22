module.exports = {
  testEnvironment: 'node',
  
  // Coverage - Solo para desarrollo, no para SonarQube
  collectCoverage: false, // Desactivado por defecto, se activa con --coverage
  
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text', 'html', 'clover'],
  
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/__tests__/',
  ],
  
  collectCoverageFrom: [
    'controllers/**/*.js',
    'models/**/*.js',
    'utils/**/*.js',
    'middlewares/**/*.js',
    '!**/__tests__/**',
    '!**/node_modules/**',
    '!**/coverage/**',
  ],
  
  // Tests
  testMatch: [
    '**/__tests__/**/*.test.js',
  ],
  
  // Excluir de tests
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '\.bak\.js$',
  ],
  
  // Setup
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Timeouts y configuración
  testTimeout: 10000,
  forceExit: true,
  detectOpenHandles: false,
};

