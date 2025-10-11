// Cookie-based auth utilities (no localStorage, no Authorization header)
function getCsrfTokenFromCookie() {
  try {
    const match = document.cookie.split('; ').find(r => r.startsWith('csrf_token='));
    return match ? decodeURIComponent(match.split('=')[1]) : null;
  } catch { return null; }
}

async function login(username, password) {
  const res = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) {
    let msg = 'Αποτυχία σύνδεσης';
    try { const j = await res.json(); msg = j.message || msg; } catch {}
    throw new Error(msg);
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

async function fetchWithAuth(url, options = {}) {
  const opts = { ...options };
  opts.credentials = 'include';

  const headers = new Headers(opts.headers || {});
  const csrf = getCsrfTokenFromCookie();
  if (csrf) headers.set('X-CSRF-Token', csrf);

  if (opts.body && !(opts.body instanceof FormData)) {
    if (typeof opts.body !== 'string') opts.body = JSON.stringify(opts.body);
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  }
  opts.headers = headers;

  const res = await fetch(url, opts);
  if (res.status === 401) {
    try { await logout(); } catch {}
    throw new Error('Unauthorized');
  }
  return res;
}

export { login, logout, isLoggedIn, fetchWithAuth };
