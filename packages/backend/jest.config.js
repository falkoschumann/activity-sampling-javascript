/** @type {import('jest').Config} */
const config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup-files-after-env.js'],
  watchPathIgnorePatterns: ['<rootDir>/packages/*/data/'],
};

export default config;
