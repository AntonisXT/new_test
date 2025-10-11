const API_URL = "";

// Cookie-based auth: the server sets an HttpOnly cookie on successful login.
// We do not store tokens in localStorage anymore.

// Lightweight login/logout helpers
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
  try {
    await fetch('/auth/logout', { method: 'POST', credentials: 'include' });
  } catch {}
}

// Determine if user is logged in by calling a lightweight check endpoint
async function isLoggedIn() {
  try {
    const res = await fetch('/auth/check', { credentials: 'include' });
    return res.ok;
  } catch {
    return false;
  }
}

// Centralized fetch that includes credentials and handles common errors
async function fetchWithAuth(url, options = {}) {
  const opts = { ...options };
  opts.credentials = 'include';

  // For JSON payloads, make sure headers are set correctly (unless body is FormData)
  if (opts.body && !(opts.body instanceof FormData)) {
    opts.headers = { ...(opts.headers || {}), 'Content-Type': 'application/json' };
    if (typeof opts.body !== 'string') opts.body = JSON.stringify(opts.body);
  }

  const response = await fetch(url, opts);

  // Handle Unauthorized
  if (response.status === 401) {
    try { await logout(); } catch {}
    alert('Η σύνδεση έληξε, παρακαλώ ξανασυνδεθείτε.');
    throw new Error('Unauthorized');
  }

  return response;
}

export { login, isLoggedIn, logout, fetchWithAuth };
