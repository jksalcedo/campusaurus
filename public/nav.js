import { CampusaurusAPI } from '/api.js';

async function updateAuthUI() {
    console.log("Updating Navbar Auth UI...");
    const authSection = document.getElementById('nav-auth-section');
    if (!authSection) {
        console.error("Navbar auth section element (#nav-auth-section) not found!");
        return;
    }

    try {
        const user = await CampusaurusAPI.me();
        console.log("Navbar Auth Check - Current User:", user);
        
        if (user) {
            // User is logged in
            authSection.innerHTML = `
                <a href="/profile/index.html" style="text-decoration: none; color: var(--text-light); font-weight: bold;">My Profile</a>
                <button id="logout-btn-nav" style="background: none; border: 1px solid var(--border-moss); color: var(--text-muted); cursor: pointer; padding: 5px 10px; border-radius: 4px; font-weight: bold; font-size: 12px; margin-left: 10px;">Logout</button>
            `;
            
            document.getElementById('logout-btn-nav')?.addEventListener('click', async () => {
                await CampusaurusAPI.auth.logout();
                window.location.href = "/login/index.html";
            });
        } else {
            // Not logged in
            authSection.innerHTML = `
                <a href="/login/index.html" style="text-decoration: none; color: var(--text-light); font-weight: bold;">Login</a>
                <a href="/register/index.html" style="text-decoration: none; color: var(--amber-accent); font-weight: bold; margin-left: 10px;">Register</a>
            `;
        }
    } catch (err) {
        console.error("Navbar auth check failed", err);
        // Fallback to login/register on error
        authSection.innerHTML = `
            <a href="/login/index.html" style="text-decoration: none; color: var(--text-light); font-weight: bold;">Login</a>
            <a href="/register/index.html" style="text-decoration: none; color: var(--amber-accent); font-weight: bold; margin-left: 10px;">Register</a>
        `;
    }
}

// Run it
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateAuthUI);
} else {
    updateAuthUI();
}
