import { CampusaurusAPI } from '/api.js';

const registerForm = document.getElementById('register-form');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = document.getElementById('submit-btn');
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        submitBtn.innerText = "ESTABLISHING...";
        submitBtn.disabled = true;

        try {
            const user = await CampusaurusAPI.auth.register(email, password, username);
            if (user) {
                // Success! Redirect to profile or home
                window.location.href = "/profile/index.html";
            }
        } catch (error) {
            console.error(error);
            alert("Identity creation failed: " + error.message);
        } finally {
            submitBtn.innerText = "ESTABLISH IDENTITY";
            submitBtn.disabled = false;
        }
    });
}
