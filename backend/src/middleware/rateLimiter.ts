import rateLimit from "express-rate-limit";

// Lets the test suite turn limiting off so unrelated tests aren't throttled,
// while the dedicated rate-limit test can re-enable it for the real limiter.
const skip = (): boolean => process.env.RATE_LIMIT_DISABLED === "true";

// Tight limit on auth routes — slows brute-force credential attacks.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many attempts. Try again later." },
  skip
});

// Broad limit across the whole API.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  skip
});
