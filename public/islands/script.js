    import { CampusaurusAPI } from '/api.js';

    async function loadIslandStats() {
        try {
            // Fetch the live counts from your backend
            const data = await CampusaurusAPI.islands.stats();
            const stats = data.stats; // Looks like: { ccs: 5, cea: 0, cas: 12 ... }

            // Array of all your island IDs
            const islands = ['ccs', 'cea', 'chs', 'cthbm', 'ctde', 'cas'];

            // Loop through and update the HTML for each one
            islands.forEach(island => {
                const countElement = document.getElementById(`count-${island}`);
                if (countElement) {
                    const count = stats[island] || 0;
                    countElement.innerText = `${count} Nests Active`;
                }
            });

        } catch (error) {
            console.error("Failed to load map data:", error);
            // If the server fails, show an error state
            document.querySelectorAll('.nest-count').forEach(el => {
                el.innerText = "Signal Lost";
                el.style.color = "#ff4500"; 
            });
        }
    }

    // Trigger the function immediately on page load
    loadIslandStats();
