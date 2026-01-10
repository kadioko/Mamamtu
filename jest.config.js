const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './', // Path to your Next.js app
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '@apollo/client/testing': '<rootDir>/src/test/mocks/apolloClientTesting.tsx',
  },
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/cypress/',
  ],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.{ts,tsx}',
    '!<rootDir>/src/**/__tests__/**',
    '!<rootDir>/src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      // Global coverage floor (kept modest but non-trivial).
      // These should always be <= actual coverage so the suite stays green.
      statements: 21,
      branches: 15,
      functions: 17,
      lines: 21,
    },
    'src/lib/security.ts': {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
