import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  displayName: {
    name: 'ai21-typescript',
    color: 'blue',
  },
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
    },
  },
  roots: ['<rootDir>'],
  testEnvironment: 'jsdom',
  testMatch: ['**/tests/**/?(*.)+(spec|test).+(ts|tsx|js)', '**/src/**/?(*.)+(spec|test).+(ts|tsx|js)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@icons(.*)$': `<rootdir>/src/assets/icons/$1`,
    '^@components(.*)$': `<rootdir>/src/components/$1`,
    '^@services(.*)$': `<rootdir>/src/services/$1`,
    '^@utils(.*)$': `<rootdir>/src/utils/$1`,
    '^@types(.*)$': `<rootdir>/src/types/$1`,
    uuid: require.resolve('uuid'),
  },
};

export default config;