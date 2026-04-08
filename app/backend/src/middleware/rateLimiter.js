const rateLimit = require('express-rate-limit');

// Rate limiter for authentication endpoints
// NOTE: This exists but is NOT applied to auth routes in the vulnerable version (V11)
// FIX: Import and apply to auth routes: router.post('/login', authLimiter, controller.login)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per window
  message: { error: 'Too many login attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, generalLimiter };
