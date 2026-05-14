    import { CampusaurusAPI } from '/api.js';
    import { showToast } from '/toast.js';

    let chosenEmoji = '🦖';

    window.selectAvatar = function(emoji, element) {
        document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('avatar-selected'));
        element.classList.add('avatar-selected');
        chosenEmoji = emoji;
        document.getElementById('selected-avatar').value = emoji;
    };

    window.addEventListener('load', async () => {
        try {
            const user = await CampusaurusAPI.me();
            if (user) {
                const stats = await CampusaurusAPI.wordle.stats().catch(() => ({ totalWins: 0 }));
                updateProfileUI(user, stats);
            }
        } catch (err) {
            console.log("Not logged in.");
        }
    });

    document.getElementById('signup-form').onsubmit = async function(e) {
        e.preventDefault();
        const submitBtn = document.getElementById('submit-btn');

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const age = document.getElementById('age').value;
        const gender = document.getElementById('gender').value;
        const dept = document.getElementById('dept').value;
        const yearLevel = document.getElementById('year').value;

        try {
            submitBtn.innerText = "Processing...";
            submitBtn.disabled = true;

            await CampusaurusAPI.auth.register(email, password, username, {
                age: parseInt(age),
                gender,
                dept,
                yearLevel,
                avatarUrl: chosenEmoji
            });

            const loginData = await CampusaurusAPI.auth.login(email, password);
            updateProfileUI(loginData);
            showToast("Account created! Welcome to the Archipelago.", 'success');

        } catch (error) {
            showToast(error.message || "An error occurred during signup.", 'error');
        } finally {
            submitBtn.innerText = "Verify & Evolve";
            submitBtn.disabled = false;
        }
    };

    function updateProfileUI(userData, wordleStats = { totalWins: 0 }) {
        document.getElementById('display-username').innerText = "u/" + (userData.username || "Student");
        document.getElementById('display-email').innerText = userData.email || "";
        document.getElementById('display-dino').innerText = userData.avatarUrl || userData.avatar_url || chosenEmoji;
        document.getElementById('display-dept').innerText = userData.dept || "Explorer";
        document.getElementById('display-year').innerText = userData.yearLevel || userData.year_level || "";
        document.getElementById('stat-wordle').innerText = `Total Wordle Wins: ${wordleStats.totalWins}`;
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('user-profile').style.display = 'block';
    }

    window.logout = async function() {
        try {
            await CampusaurusAPI.auth.logout();
            location.reload();
        } catch (error) {
            showToast("Logout failed: " + error.message, 'error');
        }
    };
