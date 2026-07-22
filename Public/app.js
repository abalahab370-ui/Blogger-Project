const AUTH_URL = '/api';

// Role Codes
const ROLES = {
    USER: 2001,
    ADMIN: 2020
};

/**
 * Decodes Base64URL JWT payload in memory
 */
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(window.atob(base64));
    } catch (err) {
        return null;
    }
}

/**
 * Triggered by <script>initAuthPage();</script> in login.html
 */
function initAuthPage() {
    const form = document.getElementById('authForm');
    const toggleBtn = document.getElementById('toggleAuthMode');
    const submitBtn = document.getElementById('submitBtn');
    const title = document.getElementById('authTitle');
    const subtitle = document.getElementById('authSubtitle');

    let isLoginMode = true;

    // 1. Toggle UI between Login and Register
    toggleBtn?.addEventListener('click', () => {
        isLoginMode = !isLoginMode;
        title.innerText = isLoginMode ? "Welcome Back" : "Create Account";
        subtitle.innerText = isLoginMode ? "Log in to your account." : "Sign up for a new account.";
        submitBtn.innerText = isLoginMode ? "Sign In" : "Register Account";
        toggleBtn.innerText = isLoginMode ? "Don't have an account? Create one here" : "Already have an account? Log in";
    });

    // 2. Handle Form Submission
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const endpoint = isLoginMode ? `${AUTH_URL}/login` : `${AUTH_URL}/regist`;

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Receives the HttpOnly refresh cookie
                body: JSON.stringify({ username, password })
            });

            // Parse text safely before converting to JSON
            const text = await res.text();
            const data = text ? JSON.parse(text) : {};

            if (!res.ok) {
                throw new Error(data.message || 'Authentication failed');
            }

            // If registering, switch mode to login so user can sign in
            if (!isLoginMode) {
                alert('Account registered successfully! Please log in.');
                toggleBtn.click();
                return;
            }

            // 3. Decode JWT & read nested userInfo
            const payload = parseJwt(data.accessToken);
            const userRole = payload?.userInfo?.roles;

            if (!userRole) {
                throw new Error('Invalid token payload structure');
            }

            // 4. Role-based redirect
           
                window.location.href = '/index.html';
                
        } catch (err) {
            alert(err.message);
        }
    });
}