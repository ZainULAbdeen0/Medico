// Disable rate limiting by default for the test suite so unrelated tests
// aren't throttled. The dedicated rate-limit test re-enables it per-test.
process.env.RATE_LIMIT_DISABLED = "true";
