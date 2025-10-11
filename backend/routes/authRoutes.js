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
      { expiresIn: '1h' }
    );
    res.json({ token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Κάτι πήγε στραβά.' });
  }
});

module.exports = router;


/** Return current user using cookie-based auth */
router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const user = await User.findById(req.user.sub).select('_id username role');
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    res.json({ user: { id: user._id, username: user.username, role: user.role } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Κάτι πήγε στραβά.' });
  }
});

/** Logout: clear cookies */
router.post('/logout', (req, res) => {
  res.clearCookie('access_token', { path: '/' });
  res.clearCookie('logged_in', { path: '/' });
  res.json({ ok: true });
});
