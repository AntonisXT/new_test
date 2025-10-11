const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { loginLimiter } = require('../server/security/rateLimiters');
const validate = require('../server/middleware/validate');
const { loginBody } = require('../server/validation/schemas');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /auth/login → set cookies
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
      domain: process.env.COOKIE_DOMAIN || undefined,
      maxAge: 15 * 60 * 1000
    });

    const csrfToken = crypto.randomBytes(16).toString('hex');
    res.cookie('csrf_token', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.COOKIE_SAMESITE || 'None',
      path: '/',
      domain: process.env.COOKIE_DOMAIN || undefined,
      maxAge: 15 * 60 * 1000
    });

    return res.json({ ok: true, user: { username: user.username, role: user.role } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Κάτι πήγε στραβά.' });
  }
});

// GET /auth/check (protected)
router.get('/check', auth, (req, res) => {
  return res.json({ ok: true, user: { id: req.user.sub, username: req.user.username, role: req.user.role } });
});

// GET /auth/status (always 200)
router.get('/status', (req, res) => {
  try {
    const token = req.cookies?.access_token;
    if (!token) return res.json({ ok: false });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ ok: true, user: { id: decoded.sub, username: decoded.username, role: decoded.role } });
  } catch {
    return res.json({ ok: false });
  }
});

// POST /auth/logout → clear cookies (host-only + domain)
router.post('/logout', (req, res) => {
  const base = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.COOKIE_SAMESITE || 'None',
    path: '/',
  };
  const domain = process.env.COOKIE_DOMAIN || undefined;

  // access_token
  res.clearCookie('access_token', base);
  res.clearCookie('access_token', { ...base, domain });
  res.cookie('access_token', '', { ...base, maxAge: 0 });
  res.cookie('access_token', '', { ...base, domain, maxAge: 0 });

  // csrf_token (readable)
  const readable = { ...base, httpOnly: false };
  res.clearCookie('csrf_token', readable);
  res.clearCookie('csrf_token', { ...readable, domain });
  res.cookie('csrf_token', '', { ...readable, maxAge: 0 });
  res.cookie('csrf_token', '', { ...readable, domain, maxAge: 0 });

  return res.json({ ok: true });
});

module.exports = router;
