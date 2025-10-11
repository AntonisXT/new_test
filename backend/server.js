// backend/server.js
require('dotenv').config();

const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const favicon = require('serve-favicon');

const connectDB = require('./config/db');
const morganLogging = require('./server/logging');
const createCsp = require('./server/security/csp');
const sanitizeBodyHtml = require('./server/middleware/sanitizeHtml');
const errorHandler = require('./server/middleware/errorHandler');

// Routes
const authRoutes = require('./routes/authRoutes');
const categoriesRoutes = require('./routes/categories');
const biographyRoutes = require('./routes/biography');
const paintingsRoutes = require('./routes/paintings');
const exhibitionsRoutes = require('./routes/exhibitions');
const linksRoutes = require('./routes/links');
const docsRouter = require('./server/docs');

const app = express();
app.disable('x-powered-by');

// Favicon & static
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));

// Healthz
app.get('/healthz', (_req, res) => res.json({ ok: true }));

// Security headers
app.use(helmet({ crossOriginEmbedderPolicy: false }));

// Logging
morganLogging(app);

// CSP
app.use(
  createCsp({
    frontendHosts: [process.env.FRONTEND_ORIGIN || "'self'"],
    apiHosts: [process.env.API_ORIGIN || "'self'"],
  })
);

// Rate limit & proxy
app.use(rateLimit({ windowMs: 10 * 60 * 1000, max: 300 }));
app.set('trust proxy', 1);

// DB
connectDB();

// ---- Middlewares πριν από τα routes ----
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN, // π.χ. https://your-app.vercel.app
    credentials: true,                   // απαραίτητο για cookies
  })
);
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(cookieParser());                 // ✅ ΧΡΗΣΙΜΟΠΟΙΕΙΤΑΙ ΠΡΙΝ ΤΑ ROUTES
app.use(sanitizeBodyHtml());

// ---- Routes ----
app.use('/auth', authRoutes);
app.use('/login', authRoutes);           // αν το χρειάζεσαι για συμβατότητα

app.use('/api/docs', docsRouter);
app.use('/api/categories', categoriesRoutes);
app.use('/api/biography', biographyRoutes);
app.use('/api/paintings', paintingsRoutes);
app.use('/api/exhibitions', exhibitionsRoutes);
app.use('/api/links', linksRoutes);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 10000;
module.exports = app;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
