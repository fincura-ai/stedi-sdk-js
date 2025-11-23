/** @type {import('jest').Config} */

const config = {
  displayName: 'stedi-sdk-js',

  extensionsToTreatAsEsm: ['.ts'],

  injectGlobals: true,

  moduleNameMapper: {
    // remap .js ESM paths import since Jest does not handle them properly
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testEnvironment: 'jest-environment-node',
  testMatch: ['**/?(*.)+(spec|test).ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  testTimeout: 180_000,
  transform: {
    '^.+\\.tsx?$': ['@swc/jest'],
  },
};

export default config;
