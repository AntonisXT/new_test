
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

function isTrustedOrigin(req) {
  const origin = req.get('origin') || '';
  const referer = req.get('referer') || '';
  const allowed = process.env.FRONTEND_ORIGIN || '';
  return (!!allowed && (origin === allowed || (referer && referer.startsWith(allowed))));
}


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

    // Accept if double-submit tokens match
    if (cookieToken && headerToken && cookieToken === headerToken) {
      return next();
    }

    // Alternatively, accept if request comes from trusted same-origin (Origin/Referer)
    if (isTrustedOrigin(req)) {
      return next();
    }

    return res.status(403).json({ error: { code: 'CSRF', message: 'Invalid CSRF token' } });
  };
}

module.exports = createCsrfMiddleware;
