
/**
 * Double Submit Cookie CSRF middleware
 * - Reads csrf_token from cookie and compares to X-CSRF-Token header.
 * - Enforced only for state-changing methods (POST/PUT/PATCH/DELETE).
 * - Whitelists certain auth endpoints (login, logout) and static/docs.
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

function createCsrfMiddleware(options = {}) {
  const whitelist = options.whitelist || DEFAULT_WHITELIST;

  return function requireCsrf(req, res, next) {
    // Skip if method is not state-changing
    if (!isStateChanging(req)) return next();

    // Skip whitelisted paths
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



/**
 * Extract all cookie values for a given name. Handles host-only and domain cookies,
 * and returns a set of decoded values.
 */
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

module.exports = createCsrfMiddleware;
