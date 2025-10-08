const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 'TOO_MANY_ATTEMPTS', message: 'Too many login attempts. Please try again shortly.' },
});

module.exports = { loginLimiter };
