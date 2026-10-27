import rateLimit from 'express-rate-limit';

// General API rate limit - 100 requests per 15 minutes
export const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute (relaxed for development)
  max: 200,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Auth endpoints - relaxed for development
export const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes.'
  }
});

// Fraud report - 7 submissions per hour (to prevent spam but allow legitimate reports)
export const fraudReportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 7,
  message: {
    success: false,
    message: 'Too many fraud reports submitted. Please try again after 1 hour.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Team verification - NO rate limit (public verification should be accessible)
// Instead, we track in database for suspicious patterns

// Admin endpoints - 200 requests per 15 minutes (higher for admin operations)
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: 'Too many admin requests, please try again later.'
  }
});

// File upload - 10 uploads per hour
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many file uploads, please try again after 1 hour.'
  }
});
