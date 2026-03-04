module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/unit/**/*.test.js"],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/**/*.test.js",
    "!src/app.js",
    "!src/config/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  verbose: true,
  testTimeout: 10000,
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
};
