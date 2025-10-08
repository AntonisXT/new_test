const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const express = require('express');
require('dotenv').config();
const path = require('path');
const favicon = require('serve-favicon');
const connectDB = require('./config/db');
const cors = require('cors');
const morganLogging = require('./server/logging');
const createCsp = require('./server/security/csp');
const sanitizeBodyHtml = require('./server/middleware/sanitizeHtml');
const errorHandler = require('./server/middleware/errorHandler');

const authRoutes = require("./routes/authRoutes");
const categoriesRoutes = require('./routes/categories');
const biographyRoutes = require('./routes/biography');
const paintingsRoutes = require('./routes/paintings');

const app = express();
const docsRouter = require('./server/docs');
app.disable('x-powered-by');
// Favicon & static assets
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/healthz', (req,res)=>res.json({ok:true}));
app.use(helmet({crossOriginEmbedderPolicy: false}));
// Request logging
morganLogging(app);
// Content Security Policy
app.use(createCsp({
  frontendHosts: [process.env.FRONTEND_ORIGIN || "'self'"],
  apiHosts: [process.env.API_ORIGIN || "'self'"],
}));
app.use(rateLimit({ windowMs: 10 * 60 * 1000, limit: 300 }));
app.set('trust proxy', 1);

// DB
connectDB();

// MIDDLEWARES ΠΡΙΝ ΑΠΟ ΤΑ ROUTES
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
// Sanitize common HTML fields to prevent XSS
app.use(sanitizeBodyHtml());

// ROUTES
app.use('/auth', authRoutes);
app.use('/login', authRoutes);

app.use('/api/docs', docsRouter);
app.use('/api/categories', categoriesRoutes);
app.use('/api/biography', biographyRoutes);
app.use('/api/paintings', paintingsRoutes);
app.use('/api/exhibitions', require('./routes/exhibitions'));
app.use('/api/links', require('./routes/links'));

const PORT = process.env.PORT || 10000;
// Centralized error handler
app.use(errorHandler);
module.exports = app;

if (process.env.NODE_ENV !== 'test') app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
