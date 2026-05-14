import { CampusaurusAPI } from '/api.js';
import { showToast } from '/toast.js';

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
                window.location.href = "/profile/index.html";
            }
        } catch (error) {
            showToast(error.message || "Login failed. Check your credentials.", 'error');
        } finally {
            submitBtn.innerText = "AUTHORIZE ACCESS";
            submitBtn.disabled = false;
        }
    });
}
