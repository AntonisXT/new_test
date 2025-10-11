const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = (req, res, next) => {
  const raw = req.header('Authorization') || '';
  const headerToken = raw.startsWith('Bearer ') ? raw.slice(7) : (raw || '');
  const cookieToken = req.cookies && req.cookies.access_token ? req.cookies.access_token : null;
  const token = headerToken || cookieToken;

  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token is not valid' });
  }
};
module.exports = auth;
