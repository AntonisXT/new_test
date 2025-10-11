const API_URL = "";

// Read CSRF token from document.cookie (decoded)
function getCsrfTokenFromCookie() {
  try {
    const row = document.cookie.split('; ').find(r => r.startsWith('csrf_token='));
    return row ? decodeURIComponent(row.split('=')[1]) : null;
  } catch { return null; }
}

// -------- Auth actions (cookie-based) --------
async function login(username, password) {
  const res = await fetch(`/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) {
    let msg = 'Αποτυχία σύνδεσης';
    try { const j = await res.json(); msg = j.message || msg; } catch {}
    alert(msg);
    return false;
  }
  return true;
}

async function logout() {
  try { await fetch('/auth/logout', { method: 'POST', credentials: 'include' }); } catch {}
}

async function isLoggedIn() {
  try {
    const res = await fetch('/auth/check', { credentials: 'include' });
    return res.ok;
  } catch { return false; }
}

// -------- Centralized fetch with cookies + CSRF --------
async function fetchWithAuth(url, options = {}) {
  const opts = { ...options };
  opts.credentials = 'include';

  // Build headers safely (avoid overwrites)
  const h = new Headers(opts.headers || {});
  const csrf = getCsrfTokenFromCookie();
  if (csrf) h.set('X-CSRF-Token', csrf);

  // For JSON payloads, set Content-Type and stringify (not for FormData)
  if (opts.body && !(opts.body instanceof FormData)) {
    if (typeof opts.body !== 'string') opts.body = JSON.stringify(opts.body);
    if (!h.has('Content-Type')) h.set('Content-Type', 'application/json');
  }

  // Never send Authorization anymore
  h.delete('Authorization');
  opts.headers = h;

  const response = await fetch(url, opts);

  if (response.status === 401) {
    try { await logout(); } catch {}
    alert('Η σύνδεση έληξε, παρακαλώ ξανασυνδεθείτε.');
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    let err;
    try { err = await response.json(); }
    catch { err = { message: await response.text().catch(()=>'Request failed') }; }
    throw new Error(JSON.stringify(err));
  }

  return response;
}

export { login, isLoggedIn, logout, fetchWithAuth };
