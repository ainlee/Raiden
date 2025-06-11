module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@systems/(.*)$': '<rootDir>/src/systems/$1'
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testMatch: ['**/test/**/*.test.ts'],
  collectCoverage: true,
  collectCoverageFrom: ['src/systems/PerformanceMonitor.ts'],
  coverageReporters: ['json', 'html', 'text']
};