import { CampusaurusAPI } from '/api.js';

// Show/Hide the specific zone input based on dropdown selection
const categorySelect = document.getElementById('category');
const specificZoneContainer = document.getElementById('specific-zone-container');
const specificZoneLabel = document.getElementById('specificZoneLabel');

if (categorySelect) {
    categorySelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'island') {
            specificZoneContainer.style.display = 'block';
            specificZoneLabel.innerText = "WHICH ISLAND?";
        } else if (val === 'nest') {
            specificZoneContainer.style.display = 'block';
            specificZoneLabel.innerText = "WHICH NEST?";
        } else {
            specificZoneContainer.style.display = 'none';
        }
    });
}

// Handle Form Submission
const createForm = document.getElementById('create-post-form');
if (createForm) {
    createForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = document.getElementById('submit-btn');
        submitBtn.innerText = "EXCAVATING...";
        submitBtn.disabled = true;

        let categoryId = document.getElementById('category').value;
        const specificZone = document.getElementById('specificZone').value;
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;

        if ((categoryId === 'island' || categoryId === 'nest') && specificZone) {
            categoryId = `${categoryId}:${specificZone}`;
        }

        try {
            if (categoryId === 'announcement') {
                await CampusaurusAPI.announcements.create({
                    title: title,
                    body: content 
                });
                alert("Amber Alert Broadcasted Successfully!");
                window.location.href = "../announcements/"; 
            } else {
                await CampusaurusAPI.posts.create({
                    title: title,
                    content: content,
                    categoryId: categoryId
                });
                alert("Discovery logged successfully!");
                window.location.href = "../index/"; 
            }
        } catch (error) {
            console.error(error);
            alert("Failed to log discovery. System error: " + error.message);
        } finally {
            submitBtn.innerText = "PUBLISH RECORD";
            submitBtn.disabled = false;
        }
    });
}
