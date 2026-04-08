const rateLimit = require('express-rate-limit');
const env = require('../config/environment');

/**
 * General rate limiter — 100 requests per 15 min window.
 */
const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
      details: [],
    },
    meta: { timestamp: new Date().toISOString() },
  },
});

/**
 * Stricter rate limiter for decision endpoints — 10 requests per minute.
 */
const decisionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: env.DECISION_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    error: {
      code: 'DECISION_RATE_LIMIT_EXCEEDED',
      message: 'Too many decision requests. Please wait before submitting another.',
      details: [],
    },
    meta: { timestamp: new Date().toISOString() },
  },
});

module.exports = { generalLimiter, decisionLimiter };
