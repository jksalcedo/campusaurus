    import { CampusaurusAPI } from '../api.js';

    let chosenEmoji = '🦖';

    // Make avatar selection global so HTML can call it
    window.selectAvatar = function(emoji, element) {
        document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('avatar-selected'));
        element.classList.add('avatar-selected');
        chosenEmoji = emoji;
        document.getElementById('selected-avatar').value = emoji;
    };

    // Check login status on page load
    window.addEventListener('load', async () => {
        try {
            const user = await CampusaurusAPI.me();
            if (user) {
                // If logged in, fetch extra stats and show profile
                const stats = await CampusaurusAPI.wordle.stats().catch(() => ({ totalWins: 0 }));
                updateProfileUI(user, stats);
            }
        } catch (err) {
            console.log("Not logged in.");
        }
    });

    // Handle Form Submission
    document.getElementById('signup-form').onsubmit = async function(e) {
        e.preventDefault();
        const submitBtn = document.getElementById('submit-btn');
        
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const bio = `Department: ${document.getElementById('dept').value}, Year: ${document.getElementById('year').value}`;

        try {
            submitBtn.innerText = "Processing...";
            submitBtn.disabled = true;

            // 1. Register user
            await CampusaurusAPI.auth.register(email, password, username);
            
            // 2. Login immediately
            const loginData = await CampusaurusAPI.auth.login(email, password);
            
            // 3. Save the chosen dino and bio details to the profile
            await CampusaurusAPI.profile.update({ 
                username: username,
                bio: bio,
                avatarUrl: chosenEmoji 
            });

            updateProfileUI(loginData);
            alert("Account created! Welcome to the Archipelago.");

        } catch (error) {
            console.error("Signup error:", error);
            alert(error.message || "An error occurred during signup.");
        } finally {
            submitBtn.innerText = "Verify & Evolve";
            submitBtn.disabled = false;
        }
    };

    // UI Update Helper
    function updateProfileUI(userData, wordleStats = { totalWins: 0 }) {
        document.getElementById('display-username').innerText = "u/" + (userData.username || "Student");
        document.getElementById('display-email').innerText = userData.email || "";
        
        // Use saved avatar if available, otherwise use current selection
        document.getElementById('display-dino').innerText = userData.avatarUrl || chosenEmoji;
        
        // Pull dept/year from inputs for now as a fallback
        document.getElementById('display-dept').innerText = document.getElementById('dept').value;
        document.getElementById('display-year').innerText = document.getElementById('year').value;

        // Update stats from the API
        document.getElementById('stat-wordle').innerText = `Total Wordle Wins: ${wordleStats.totalWins}`;

        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('user-profile').style.display = 'block';
    }

    // Global Logout function
    window.logout = async function() {
        try {
            await CampusaurusAPI.auth.logout();
            location.reload(); // Refresh to reset UI state
        } catch (error) {
            alert("Logout failed: " + error.message);
        }
    };
