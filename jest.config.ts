import { type Config } from 'jest';

const config: Config = {
  verbose: false,
  transform: {
    '^.+\\.(js|ts)$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
  testEnvironment: 'node',
  setupFiles: ['dotenv/config'],
  forceExit: true,
  detectOpenHandles: true,
  transformIgnorePatterns: ['/node_modules/(?!uuid)'],
  moduleNameMapper: require('ts-jest').pathsToModuleNameMapper(require('./tsconfig.json').compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
};

module.exports = config;
