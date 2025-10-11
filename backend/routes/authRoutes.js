const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();
const { loginLimiter } = require('../server/security/rateLimiters');
const validate = require('../server/middleware/validate');
const { loginBody } = require('../server/validation/schemas');

router.post('/login', loginLimiter, validate({ body: loginBody }), async (req, res) => {
  try {
    const { username, password } = req.body ?? {};
    if (!username || !password) return res.status(400).json({ message: 'Λείπουν πεδία.' });

    const user = await User.findOne({ username, isActive: true });
    if (!user) return res.status(401).json({ message: 'Λάθος στοιχεία.' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Λάθος στοιχεία.' });

    const token = jwt.sign(
      { sub: user._id.toString(), username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Κάτι πήγε στραβά.' });
  }
});

module.exports = router;


router.post('/logout', (req, res) => {
  const base = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.COOKIE_SAMESITE || 'None',
    path: '/',
  };
  const domain = process.env.COOKIE_DOMAIN || undefined;

  // 1) Clear host-only cookie
  res.clearCookie('access_token', base);
  // 2) Clear domain cookie (if it exists)
  res.clearCookie('access_token', { ...base, domain });

  // 3) Extra safety: overwrite with immediate expiry in both forms
  res.cookie('access_token', '', { ...base, maxAge: 0 });
  res.cookie('access_token', '', { ...base, domain, maxAge: 0 });

  return res.json({ ok: true });
});
