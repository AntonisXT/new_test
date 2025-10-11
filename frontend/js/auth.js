const API_URL = "";

// -- Helpers: decode/validate JWT on the client --
function parseJwt(token){
    try{
        const base64Url = token.split('.')[1];
        if(!base64Url) return null;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    }catch(e){ return null; }
}
function isTokenExpired(token){
    const payload = parseJwt(token);
    if(!payload || !payload.exp) return false;
    const nowSec = Math.floor(Date.now()/1000);
    return payload.exp <= nowSec;
}

// Είσοδος χρήστη
async function login(username, password) {
    try {
        const response = await fetch('/auth/login', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            alert(error.message || "Λάθος στοιχεία σύνδεσης");
            return;
        }

        const data = await response.json();
        localStorage.setItem("token", data.token);
        window.location.href = "index.html";
    } catch (error) {
        console.error("Απρόσμενο σφάλμα σύνδεσης:", error);
        alert("Υπήρξε πρόβλημα με το δίκτυο ή τον server");
    }
}

// Έλεγχος αν ο χρήστης είναι συνδεδεμένος
function isLoggedIn() {
    const token = localStorage.getItem("token");
    if (!token) return false;
    if (isTokenExpired(token)) { try { localStorage.removeItem("token"); } catch{} return false; }
    return true;
}

function getToken() {
    return localStorage.getItem("token");
}

function logout() {
    localStorage.removeItem("token");
    // εδώ μπορούμε να κάνουμε redirect στο login αν θέλουμε
}

// fetch με Auth header
async function fetchWithAuth(url, options = {}) {
    const token = getToken();
    if (!token) {
        alert("Δεν έχετε συνδεθεί");
        throw new Error("No authentication token");
    }

    const isFormData = options && options.body instanceof FormData;
    const headers = {
      ...(options.headers || {}),
      'Authorization': `Bearer ${token}`,
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    };

    try {
        const response = await fetch(url, { ...options, headers });

        if (!response.ok) {
            if (response.status === 401) {
                // Αναμενόμενο: ληγμένο/λάθος token → logout σιωπηρά + μήνυμα
                try { logout(); } catch {}
                alert("Η σύνδεση έληξε, παρακαλώ ξανασυνδεθείτε.");
                return Promise.reject(new Error("Unauthorized"));
            }

            // Άλλα errors: φιλικό μήνυμα χωρίς console.error
            let message = 'Το αίτημα απέτυχε';
            try {
                const err = await response.json();
                message = err.message || JSON.stringify(err);
            } catch {
                try { message = await response.text(); } catch {}
            }
            alert(message);
            return Promise.reject(new Error(message));
        }

        return response;
    } catch (error) {
        // Απρόσμενο λάθος (δίκτυο κ.λπ.)
        console.error("Απρόσμενο σφάλμα fetch:", error);
        alert("Υπήρξε πρόβλημα με το δίκτυο ή τον server");
        throw error;
    }
}

// Εξαγωγή
export { login, isLoggedIn, logout, fetchWithAuth };
