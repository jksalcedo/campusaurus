import { showToast } from '/toast.js';

let currentIslandId = 'ccs';

window.toggleModal = function(show) {
    document.getElementById('nestModal').style.display = show ? 'flex' : 'none';
    if (show) document.getElementById('nestName').focus();
};

function initNestPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const islandId = urlParams.get('island');
    if (islandId) currentIslandId = islandId;

    const islandNames = {
        'ccs': 'CCS Island', 'cea': 'CEA Island', 'chs': 'CHS Island',
        'cthbm': 'CTHBM Island', 'ctde': 'CTDE Island', 'cas': 'CAS Island'
    };

    if (islandNames[currentIslandId]) {
        const name = islandNames[currentIslandId];
        document.getElementById('island-title').innerText = name + ' Nests';
        const breadcrumbSpan = document.querySelector('.breadcrumbs span');
        if (breadcrumbSpan) breadcrumbSpan.innerText = name;
        document.title = name + ' Nests | Campusaurus';
    }

    loadNests();
}

async function loadNests() {
    const container = document.getElementById('nest-container');
    container.innerHTML = '<p style="color:var(--text-muted);">Scanning radar...</p>';

    try {
        const response = await fetch(`/api/nests?island=${currentIslandId}`);
        const data = await response.json();

        if (data.nests && data.nests.length > 0) {
            container.innerHTML = data.nests.map(nest => `
                <div class="nest-card" id="nest-${nest.id}">
                    <div class="nest-info">
                        <h3>${nest.name}</h3>
                        <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 5px;">Created by <b>${nest.creatorUsername || nest.creator_username || 'Student'}</b></p>
                        <p id="desc-${nest.id}">${nest.description || ''}</p>
                        <div style="margin-top: 10px; display:flex; gap:10px;">
                            <button onclick="editNest('${nest.id}')" style="background:none; border:none; color:var(--amber-accent); cursor:pointer; font-size:12px; padding:0;">[ Edit ]</button>
                            <button onclick="deleteNest('${nest.id}')" style="background:none; border:none; color:#d94a4a; cursor:pointer; font-size:12px; padding:0;">[ Delete ]</button>
                        </div>
                    </div>
                    <a href="/index/index.html?nest=${nest.id}" class="visit-btn" style="text-decoration:none;">Visit Nest</a>
                </div>
            `).join('');
        } else {
            container.innerHTML = `<p style="color:#818384; text-align:center; padding:20px;">No nests found here yet.</p>`;
        }
    } catch (error) {
        container.innerHTML = `<p style="color:#d94a4a;">Failed to connect to radar.</p>`;
    }
}

window.addNewNest = async function() {
    const name = document.getElementById('nestName').value;
    const desc = document.getElementById('nestDesc').value;

    if (!name || !desc) {
        showToast("Fill in both the name and description!", 'error');
        return;
    }

    try {
        const response = await fetch('/api/nests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ islandId: currentIslandId, name, description: desc })
        });

        if (response.ok) {
            window.toggleModal(false);
            document.getElementById('nestName').value = "";
            document.getElementById('nestDesc').value = "";
            loadNests();
        } else {
            const data = await response.json();
            showToast(data.error || "Failed to create nest.", 'error');
        }
    } catch (error) {
        showToast("Network error.", 'error');
    }
};

window.editNest = async function(nestId) {
    const newDesc = prompt("Enter a new description:");
    if (!newDesc) return;

    try {
        const response = await fetch(`/api/nests/${nestId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description: newDesc })
        });

        if (response.ok) {
            document.getElementById(`desc-${nestId}`).innerText = newDesc;
            showToast("Nest updated.", 'success');
        } else {
            showToast("Failed to update nest.", 'error');
        }
    } catch (error) {
        showToast("Network error.", 'error');
    }
};

window.deleteNest = async function(nestId) {
    if (!confirm("Are you sure you want to delete this nest?")) return;

    try {
        const response = await fetch(`/api/nests/${nestId}`, { method: 'DELETE' });
        if (response.ok) {
            loadNests();
            showToast("Nest deleted.", 'info');
        } else {
            showToast("Failed to delete nest.", 'error');
        }
    } catch (error) {
        showToast("Network error.", 'error');
    }
};

document.addEventListener('DOMContentLoaded', initNestPage);