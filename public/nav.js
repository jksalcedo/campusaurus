import { CampusaurusAPI } from '/api.js';

async function updateAuthUI() {
    const authSection = document.getElementById('auth-section');
    if (!authSection) return;

    try {
        const user = await CampusaurusAPI.me();
        if (user) {
            // User is logged in
            authSection.innerHTML = `
                <a href="/profile/index.html" style="text-decoration: none; color: var(--text-light); font-weight: bold;">My Profile</a>
                <button id="logout-btn" style="background: none; border: 1px solid var(--border-moss); color: var(--text-muted); cursor: pointer; padding: 5px 10px; border-radius: 4px; font-weight: bold; font-size: 12px;">Logout</button>
            `;
            
            document.getElementById('logout-btn')?.addEventListener('click', async () => {
                await CampusaurusAPI.auth.logout();
                window.location.href = "/login/index.html";
            });
        } else {
            // Not logged in (default state already in HTML, but good to ensure)
            authSection.innerHTML = `
                <a href="/login/index.html" style="text-decoration: none; color: var(--text-light); font-weight: bold;">Login</a>
                <a href="/register/index.html" style="text-decoration: none; color: var(--amber-accent); font-weight: bold;">Register</a>
            `;
        }
    } catch (err) {
        console.error("Auth check failed", err);
    }
}

document.addEventListener('DOMContentLoaded', updateAuthUI);
