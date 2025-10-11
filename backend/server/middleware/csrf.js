/**
 * Double Submit Cookie CSRF middleware
 * - For state-changing methods only (POST/PUT/PATCH/DELETE).
 * - Checks that X-CSRF-Token header equals one of the csrf_token cookies.
 * - Whitelists common non-mutating/auth paths.
 */
function isStateChanging(req) {
  const m = (req.method || '').toUpperCase();
  return m === 'POST' || m === 'PUT' || m === 'PATCH' || m === 'DELETE';
}

const DEFAULT_WHITELIST = [
  /^\/auth\/login$/,
  /^\/auth\/logout$/,
  /^\/auth\/check$/,
  /^\/api\/docs(\/.*)?$/,
  /^\/openapi\.json$/,
  /^\/favicon\.ico$/,
];

/** Extract all cookie values for a given name from raw Cookie header (handles host-only & domain cookies) */
function getCookieValues(req, name) {
  const raw = req.headers?.cookie || '';
  const parts = raw.split(';').map(s => s.trim()).filter(Boolean);
  const values = new Set();
  for (const p of parts) {
    const idx = p.indexOf('=');
    if (idx === -1) continue;
    const k = p.slice(0, idx);
    const v = p.slice(idx + 1);
    if (k === name) {
      try { values.add(decodeURIComponent(v)); } catch { values.add(v); }
    }
  }
  return values;
}

function createCsrfMiddleware(options = {}) {
  const whitelist = options.whitelist || DEFAULT_WHITELIST;

  return function requireCsrf(req, res, next) {
    if (!isStateChanging(req)) return next();

    const path = req.path || req.url || '';
    for (const rx of whitelist) {
      if (rx.test(path)) return next();
    }

    const headerToken = req.get('x-csrf-token');
    const cookieTokens = getCookieValues(req, 'csrf_token');

    if (!headerToken || cookieTokens.size === 0 || !cookieTokens.has(headerToken)) {
      return res.status(403).json({ error: { code: 'CSRF', message: 'Invalid CSRF token' } });
    }
    return next();
  };
}

module.exports = createCsrfMiddleware;
