module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/src/tests/**/*.test.ts"],
  setupFiles: ["<rootDir>/src/tests/setup.ts"],
  testTimeout: 20000
};