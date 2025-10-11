const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const express = require('express');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const path = require('path');
const favicon = require('serve-favicon');
const connectDB = require('./config/db');
const cors = require('cors');
const morganLogging = require('./server/logging');
const createCsp = require('./server/security/csp');
const sanitizeBodyHtml = require('./server/middleware/sanitizeHtml');
const errorHandler = require('./server/middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const categoriesRoutes = require('./routes/categories');
const biographyRoutes = require('./routes/biography');
const paintingsRoutes = require('./routes/paintings');

const app = express();
const docsRouter = require('./server/docs');

app.disable('x-powered-by');

// Favicon & static assets
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));

// Health
app.get('/healthz', (req, res) => res.json({ ok: true }));

// Security headers
app.use(helmet({ crossOriginEmbedderPolicy: false }));

// Request logging
morganLogging(app);

// Content Security Policy
app.use(
  createCsp({
    frontendHosts: [process.env.FRONTEND_ORIGIN || "'self'"],
    apiHosts: [process.env.API_ORIGIN || "'self'"],
  })
);

// Rate limiting (χρησιμοποίησε `max` στην τρέχουσα έκδοση)
app.use(rateLimit({ windowMs: 10 * 60 * 1000, max: 300 }));
app.set('trust proxy', 1);

// DB
connectDB();

// MIDDLEWARES ΠΡΙΝ ΑΠΟ ΤΑ ROUTES
app.use(cors({ origin: process.env.FRONTEND_ORIGIN, credentials: false }));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(cookieParser());
// Sanitize common HTML fields to prevent XSS
app.use(sanitizeBodyHtml());

// ROUTES
app.use('/auth', authRoutes);
app.use('/api/docs', docsRouter);
app.use('/api/categories', categoriesRoutes);
app.use('/api/biography', biographyRoutes);
app.use('/api/paintings', paintingsRoutes);
app.use('/api/exhibitions', require('./routes/exhibitions'));
app.use('/api/links', require('./routes/links'));

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 10000;
module.exports = app;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
