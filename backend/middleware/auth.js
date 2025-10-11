const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = (req, res, next) => {
    const token = (req.cookies && req.cookies.access_token) || (req.header('Authorization')||'').replace(/^Bearer\s+/, '');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error(err.message);
    return res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = auth;
