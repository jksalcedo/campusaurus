import { CampusaurusAPI } from '/api.js';

function escapeHtml(str) {
    return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function renderEmpty(el) {
    el.className = 'state';
    el.textContent = 'No active alerts on the radar.';
}

function renderAnnouncements(el, announcements) {
    if (!Array.isArray(announcements) || announcements.length === 0) {
        renderEmpty(el);
        return;
    }

    el.className = '';
    el.innerHTML = announcements.map(a => {
        const author = escapeHtml(a.author ?? 'Admin');
        const title = escapeHtml(a.title ?? 'Announcement');
        // If API returns body instead of content, we handle both just in case
        const content = escapeHtml(a.body || a.content || ''); 
        const createdAt = escapeHtml(a.createdAt ?? '');
        const badge = escapeHtml(a.badge ?? 'Official');

        return `
            <div class="alert-card">
                <div class="alert-header">
                    <h2 class="alert-title">${title}</h2>
                    <span class="badge">${badge}</span>
                </div>
                <div class="alert-body">
                    ${content}
                </div>
                <div class="alert-footer">
                    <div class="author-tag">🏛️ Posted by ${author}</div>
                    <div>${createdAt ? new Date(createdAt).toLocaleDateString() : ''}</div>
                </div>
            </div>
        `;
    }).join('');
}

async function loadAnnouncements() {
    const el = document.getElementById('announcements');

    try {
        const data = await CampusaurusAPI.announcements.list();
        renderAnnouncements(el, data.announcements);
    } catch (err) {
        el.className = 'state';
        el.textContent = 'Signal lost. Could not load alerts.';
        console.error(err);
    }
}

loadAnnouncements();
