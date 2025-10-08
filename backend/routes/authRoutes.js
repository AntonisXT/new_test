const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();
const { loginLimiter } = require('../server/security/rateLimiters');

router.post('/login', loginLimiter, async (req, res) => {
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
