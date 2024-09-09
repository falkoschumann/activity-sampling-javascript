/** @type {import('jest').Config} */
const config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup-files-after-env.js'],
  watchPathIgnorePatterns: ['<rootDir>/data/'],
};

export default config;
