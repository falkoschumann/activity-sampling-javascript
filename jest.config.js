/** @type {import('jest').Config} */
const config = {
  globalSetup: './jest.global-setup.js',
  projects: ['<rootDir>/packages/*'],
  transform: {},
  verbose: true,
};

export default config;
