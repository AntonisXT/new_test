const express = require('express');
const jwt = require('jsonwebtoken');
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
      { expiresIn: '15m' }
    );

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.COOKIE_SAMESITE || 'None',
      path: '/',
      maxAge: 15 * 60 * 1000
    });

    res.json({ ok: true, user: { username: user.username, role: user.role } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Κάτι πήγε στραβά.' });
  }
});

module.exports = router;


router.post('/logout', (req, res) => {
  res.clearCookie('access_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.COOKIE_SAMESITE || 'None',
    path: '/'
  });
  return res.json({ ok: true });
});

// Simple check route to verify cookie-authenticated session
const auth = require('../middleware/auth');
router.get('/check', auth, (req, res) => {
  return res.json({ ok: true, user: { id: req.user.sub, username: req.user.username, role: req.user.role } });
});
