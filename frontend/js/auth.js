// Cookie-based auth (HttpOnly JWT on server, helper cookie 'logged_in=yes' for UI checks)
const API_URL = "";

function hasLoggedInCookie(){
  return document.cookie.split('; ').some(c => c.trim() === 'logged_in=yes');
}

async function login(username, password) {
  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      alert(error.message || 'Λάθος στοιχεία σύνδεσης');
      return;
    }
    // Cookie set by server; just redirect
    window.location.href = 'index.html';
  } catch (e) {
    console.error('Απρόσμενο σφάλμα σύνδεσης:', e);
    alert('Υπήρξε πρόβλημα με το δίκτυο ή τον server');
  }
}

// Sync UI helper based on non-HttpOnly cookie set by server
function isLoggedIn() {
  return hasLoggedInCookie();
}

async function logout() {
  try {
    await fetch('/auth/logout', { method: 'POST', credentials: 'include' });
  } catch {}
  // Ensure UI state resets even if network fails
  try {
    document.cookie = 'logged_in=; Max-Age=0; path=/';
  } catch {}
  window.location.href = 'index.html';
}

// Fetch helper that sends cookies; attach JSON Content-Type only when needed
async function fetchWithAuth(url, options = {}) {
  const isFormData = options && options.body instanceof FormData;
  const headers = {
    ...(options.headers || {}),
    ...(isFormData ? {} : { 'Content-Type': 'application/json' })
  };
  try {
    const response = await fetch(url, { ...options, headers, credentials: 'include' });
    if (!response.ok) {
      if (response.status === 401) {
        alert('Η σύνδεση έληξε, παρακαλώ ξανασυνδεθείτε.');
        try { await logout(); } catch {}
        return Promise.reject(new Error('Unauthorized'));
      }
      let message = 'Το αίτημα απέτυχε';
      try {
        const err = await response.json();
        message = err.message || JSON.stringify(err);
      } catch {}
      alert(message);
      return Promise.reject(new Error(message));
    }
    return response;
  } catch (error) {
    console.error('Απρόσμενο σφάλμα fetch:', error);
    alert('Υπήρξε πρόβλημα με το δίκτυο ή τον server');
    throw error;
  }
}

export { login, isLoggedIn, logout, fetchWithAuth };
