
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

    const cookieToken = req.cookies?.csrf_token;
    const headerToken = req.get('x-csrf-token');

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      return res.status(403).json({ error: { code: 'CSRF', message: 'Invalid CSRF token' } });
    }
    return next();
  };
}

module.exports = createCsrfMiddleware;
