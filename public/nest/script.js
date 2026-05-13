function toggleModal(show) {
    document.getElementById('nestModal').style.display = show ? 'flex' : 'none';
}

function addNewNest() {
    const name = document.getElementById('nestName').value;
    const desc = document.getElementById('nestDesc').value;

    if (name && desc) {
        const container = document.getElementById('nest-container');
        const newCard = `
            <a href="/" class="nest-card">
                <div class="nest-info">
                    <h3>${name.startsWith('n/') ? name : 'n/' + name}</h3>
                    <p>${desc}</p>
                </div>
                <div class="visit-btn">Visit Nest</div>
            </a>
        `;
        container.innerHTML = newCard + container.innerHTML; // Adds new nest to the top
        toggleModal(false);
        
        // Clear inputs
        document.getElementById('nestName').value = "";
        document.getElementById('nestDesc').value = "";
    } else {
        alert("Fill in both the name and description!");
    }
}

// Dynamic Island Title and Breadcrumbs
function initNestPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const islandId = urlParams.get('island');
    
    const islandNames = {
        'ccs': 'CCS Island',
        'cea': 'CEA Island',
        'chs': 'CHS Island',
        'cthbm': 'CTHBM Island',
        'ctde': 'CTDE Island',
        'cas': 'CAS Island'
    };

    if (islandId && islandNames[islandId]) {
        const name = islandNames[islandId];
        document.getElementById('island-title').innerText = name + ' Nests';
        
        // Update breadcrumb span
        const breadcrumbSpan = document.querySelector('.breadcrumbs span');
        if (breadcrumbSpan) {
            breadcrumbSpan.innerText = name;
        }
        
        document.title = name + ' Nests | Campusaurus';
    }
}

document.addEventListener('DOMContentLoaded', initNestPage);
