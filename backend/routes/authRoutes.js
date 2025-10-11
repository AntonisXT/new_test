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

// POST /auth/login  → Set-Cookie: access_token (HttpOnly) + csrf_token (readable)
router.post('/login', loginLimiter, validate({ body: loginBody }), async (req, res) => {
  try {
    const { username, password } = req.body ?? {};
    if (!username || !password) {
      return res.status(400).json({ message: 'Λείπουν πεδία.' });
    }

    const user = await User.findOne({ username, isActive: true });
    if (!user) return res.status(401).json({ message: 'Λάθος στοιχεία.' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Λάθος στοιχεία.' });

    const token = jwt.sign(
      { sub: user._id.toString(), username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // HttpOnly access cookie
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.COOKIE_SAMESITE || 'None',
      path: '/',
      domain: process.env.COOKIE_DOMAIN || undefined,
      maxAge: 15 * 60 * 1000
    });

    // CSRF token (αναγνώσιμο από JS)
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


// GET /auth/state  → always 200; tells if authenticated
router.get('/state', (req, res) => {
  try {
    // Read token from Authorization: Bearer or from cookie
    const raw = req.header('Authorization') || '';
    const headerToken = raw.startsWith('Bearer ') ? raw.slice(7) : (raw || '');
    const cookieToken = req.cookies && req.cookies.access_token ? req.cookies.access_token : null;
    const token = headerToken || cookieToken;

    if (!token) {
      return res.status(200).json({ authenticated: false });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({
      authenticated: true,
      user: { id: decoded.sub, username: decoded.username, role: decoded.role }
    });
  } catch {
    return res.status(200).json({ authenticated: false });
  }
});

// GET /auth/check  → επιστρέφει ok:true αν υπάρχει έγκυρο cookie
router.get('/check', auth, (req, res) => {
  return res.json({
    ok: true,
    user: { id: req.user.sub, username: req.user.username, role: req.user.role }
  });
});

// POST /auth/logout  → καθαρίζει όλες τις παραλλαγές cookie
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
