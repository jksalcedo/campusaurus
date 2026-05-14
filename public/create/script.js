import { CampusaurusAPI } from '/api.js';
import { showToast } from '/toast.js';

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
                await CampusaurusAPI.announcements.create({ title, body: content });
                showToast("Amber Alert broadcasted successfully!", 'success');
                setTimeout(() => { window.location.href = "../announcements/"; }, 1200);
            } else {
                await CampusaurusAPI.posts.create({ title, content, categoryId });
                showToast("Discovery logged successfully!", 'success');
                setTimeout(() => { window.location.href = "../index/"; }, 1200);
            }
        } catch (error) {
            showToast(error.message || "Failed to log discovery.", 'error');
        } finally {
            submitBtn.innerText = "PUBLISH RECORD";
            submitBtn.disabled = false;
        }
    });
}
