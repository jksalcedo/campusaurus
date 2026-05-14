import { CampusaurusAPI } from '/api.js';

let chosenEmoji = '🦖';

// Handle Avatar Selection
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
            // 1. Register with all details
            await CampusaurusAPI.auth.register(email, password, username, {
                age: parseInt(age),
                gender: gender,
                dept: dept,
                yearLevel: yearLevel,
                avatarUrl: chosenEmoji
            });

            // 2. Login immediately
            const user = await CampusaurusAPI.auth.login(email, password);
            if (user) {
                alert("Account established! Welcome to the excavation team.");
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
