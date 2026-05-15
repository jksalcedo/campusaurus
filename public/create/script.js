import { CampusaurusAPI } from '/api.js';
import { showToast } from '/toast.js';

const categorySelect = document.getElementById('category');
const specificZoneContainer = document.getElementById('specific-zone-container');
const nestPickerContainer = document.getElementById('nest-picker-container');
const nestIslandSelect = document.getElementById('nestIsland');
const nestSelectElement = document.getElementById('nestSelect');
const islandSelectElement = document.getElementById('islandSelect');
const nestSearchInput = document.getElementById('nestSearch');

let nestsByIsland = {};

// Load all nests on page load
async function loadAllNests() {
    try {
        const response = await fetch('/api/nests');
        if (!response.ok) return;
        const data = await response.json();
        
        // Group nests by island
        nestsByIsland = {};
        (data.nests || []).forEach(nest => {
            const islandId = nest.islandId || nest.island_id;
            if (!nestsByIsland[islandId]) {
                nestsByIsland[islandId] = [];
            }
            nestsByIsland[islandId].push(nest);
        });
    } catch (error) {
        console.error('Failed to load nests:', error);
    }
}

// Update nest dropdown when island is selected
function updateNestDropdown() {
    const selectedIsland = nestIslandSelect.value;
    nestSelectElement.innerHTML = '<option value="">Select a nest</option>';
    
    if (selectedIsland && nestsByIsland[selectedIsland]) {
        nestsByIsland[selectedIsland].forEach(nest => {
            const option = document.createElement('option');
            option.value = nest.id;
            option.textContent = nest.name;
            nestSelectElement.appendChild(option);
        });
        nestSelectElement.disabled = false;
    } else {
        nestSelectElement.disabled = true;
    }
}

// Filter nests in dropdown based on search input
function filterNests() {
    const searchTerm = nestSearchInput.value.toLowerCase();
    const options = nestSelectElement.querySelectorAll('option');
    
    options.forEach((option, index) => {
        if (index === 0) return; // Skip the placeholder option
        const nestName = option.textContent.toLowerCase();
        option.style.display = nestName.includes(searchTerm) ? '' : 'none';
    });
}

if (categorySelect) {
    categorySelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'island') {
            specificZoneContainer.style.display = 'block';
            nestPickerContainer.style.display = 'none';
        } else if (val === 'nest') {
            specificZoneContainer.style.display = 'none';
            nestPickerContainer.style.display = 'block';
            updateNestDropdown();
        } else {
            specificZoneContainer.style.display = 'none';
            nestPickerContainer.style.display = 'none';
        }
    });
}

if (nestIslandSelect) {
    nestIslandSelect.addEventListener('change', updateNestDropdown);
}

if (nestSearchInput) {
    nestSearchInput.addEventListener('input', filterNests);
}

const createForm = document.getElementById('create-post-form');
if (createForm) {
    createForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = document.getElementById('submit-btn');
        submitBtn.innerText = "EXCAVATING...";
        submitBtn.disabled = true;

        let categoryId = document.getElementById('category').value;
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;

        // Determine the categoryId based on selection
        if (categoryId === 'island') {
            const selectedIsland = islandSelectElement.value;
            if (!selectedIsland) {
                showToast("Please select an island.", 'error');
                submitBtn.innerText = "PUBLISH RECORD";
                submitBtn.disabled = false;
                return;
            }
            categoryId = `island:${selectedIsland}`;
        } else if (categoryId === 'nest') {
            const selectedNest = nestSelectElement.value;
            if (!selectedNest) {
                showToast("Please select a nest.", 'error');
                submitBtn.innerText = "PUBLISH RECORD";
                submitBtn.disabled = false;
                return;
            }
            categoryId = `nest:${selectedNest}`;
        }

        try {
            if (categoryId === 'announcement') {
                await CampusaurusAPI.announcements.create({ title, body: content });
                showToast("Amber Alert broadcasted successfully!", 'success');
                setTimeout(() => { window.location.href = "../announcements/"; }, 1200);
            } else {
                await CampusaurusAPI.posts.create({ title, content, categoryId });
                showToast("Discovery logged successfully!", 'success');
                
                // Determine redirect based on category
                let redirectUrl = "../index/";
                if (categoryId.startsWith('nest:')) {
                    const nestId = categoryId.split(':')[1];
                    redirectUrl = `../index/index.html?nest=${nestId}`;
                } else if (categoryId.startsWith('island:')) {
                    const islandId = categoryId.split(':')[1];
                    redirectUrl = `../index/index.html?island=${islandId}`;
                }
                
                setTimeout(() => { window.location.href = redirectUrl; }, 1200);
            }
        } catch (error) {
            showToast(error.message || "Failed to log discovery.", 'error');
        } finally {
            submitBtn.innerText = "PUBLISH RECORD";
            submitBtn.disabled = false;
        }
    });
}

// Load nests on page load
loadAllNests();
