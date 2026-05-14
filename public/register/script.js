import { CampusaurusAPI } from '/api.js';
import { showToast } from '/toast.js';

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

let chosenEmoji = '🦖';

window.selectAvatar = function(emoji, element) {
    document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('avatar-selected'));
    element.classList.add('avatar-selected');
    chosenEmoji = emoji;
    document.getElementById('selected-avatar').value = emoji;
};

const registerForm = document.getElementById('register-form');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = document.getElementById('submit-btn');
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const age = document.getElementById('age').value;
        const gender = document.getElementById('gender').value;
        const dept = document.getElementById('dept').value;
        const yearLevel = document.getElementById('year').value;

        submitBtn.innerText = "ESTABLISHING...";
        submitBtn.disabled = true;

        try {
            await CampusaurusAPI.auth.register(email, password, username, {
                age: parseInt(age),
                gender,
                dept,
                yearLevel,
                avatarUrl: chosenEmoji
            });

            const user = await CampusaurusAPI.auth.login(email, password);
            if (user) {
                showToast("Account established! Welcome to the excavation team.", 'success');
                setTimeout(() => { window.location.href = "/profile/index.html"; }, 1200);
            }
        } catch (error) {
            showToast(error.message || "Identity creation failed.", 'error');
        } finally {
            submitBtn.innerText = "ESTABLISH IDENTITY";
            submitBtn.disabled = false;
        }
    });
}
