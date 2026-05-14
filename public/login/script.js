import { CampusaurusAPI } from '/api.js';

// Redirect if already logged in
async function checkAuth() {
    try {
        const user = await CampusaurusAPI.me();
        if (user) {
            window.location.href = "/profile/index.html";
        }
    } catch (err) {}
}
checkAuth();

const loginForm = document.getElementById('login-form');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = document.getElementById('submit-btn');
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        submitBtn.innerText = "VERIFYING...";
        submitBtn.disabled = true;

        try {
            const user = await CampusaurusAPI.auth.login(email, password);
            if (user) {
                // Success! Redirect to profile or home
                window.location.href = "/profile/index.html";
            }
        } catch (error) {
            console.error(error);
            alert("Security clearance failed: " + error.message);
        } finally {
            submitBtn.innerText = "AUTHORIZE ACCESS";
            submitBtn.disabled = false;
        }
    });
}
