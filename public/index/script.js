import { showToast } from '/toast.js';

// ==========================================
// 1. FEED & CRUD LOGIC
// ==========================================
let currentUser = null;
let nestNameCache = null;
let nestIslandMap = null;
let allPosts = [];

async function loadCurrentUser() {
    try {
        const response = await fetch("/api/me");
        if (!response.ok) return null;
        return await response.json();
    } catch { return null; }
}

function canEditPost(post, user) {
    if (!user) return false;
    const isAdmin = user.isAdmin || user.is_admin;
    const authorId = post.authorId || post.author_id;
    return isAdmin || authorId === user.id;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;").replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;").replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightMatch(text, query) {
    const safeText = escapeHtml(text || "");
    if (!query) return safeText;
    const pattern = new RegExp(escapeRegex(query), "gi");
    return safeText.replace(pattern, (match) => `<mark>${match}</mark>`);
}

async function loadNestNameCache() {
    if (nestNameCache && nestIslandMap) return nestNameCache;
    try {
        const response = await fetch("/api/nests");
        if (!response.ok) return null;
        const data = await response.json();
        if (!data.nests || data.nests.length === 0) return null;
        nestNameCache = new Map(data.nests.map((n) => [n.id, n.name]));
        nestIslandMap = new Map(data.nests.map((n) => [n.id, n.islandId]));
        return nestNameCache;
    } catch { return null; }
}

async function resolveNestName(nestId) {
    if (!nestId) return null;
    const cache = await loadNestNameCache();
    return cache ? (cache.get(nestId) || null) : null;
}

function resolveCategoryLabel(categoryId) {
    if (!categoryId) return "";
    if (nestNameCache && nestNameCache.has(categoryId)) return nestNameCache.get(categoryId);
    return categoryId;
}

function getIslandForPost(post) {
    const categoryId = post.category_id || "";
    if (categoryId.startsWith("island:")) return categoryId.split(":")[1] || "";
    if (nestIslandMap && nestIslandMap.has(categoryId)) return nestIslandMap.get(categoryId) || "";
    return "";
}

function getAuthorName(post) {
    return post.authorUsername || post.author_username || post.author || post.author_id || "Explorer";
}

function renderPosts(posts, query = "") {
    const container = document.getElementById("feed-container");
    if (!container) return;

    if (posts.length === 0) {
        container.innerHTML = query
            ? `<p style="color: var(--text-muted); font-style: italic;">No posts match "${escapeHtml(query)}".</p>`
            : `<p style="color: var(--text-muted); font-style: italic;">No discoveries have been logged yet.</p>`;
        return;
    }

    container.innerHTML = posts.map((post) => {
        const authorName = getAuthorName(post);
        const showActions = canEditPost(post, currentUser);
        const kebabMenu = showActions
            ? `<div class="post-menu" id="menu-${post.id}">
                    <button class="post-menu-btn" onclick="togglePostMenu('${post.id}', event)" aria-label="Post options">&#8942;</button>
                    <div class="post-menu-dropdown" id="dropdown-${post.id}">
                        <button onclick="openEditModal('${post.id}'); closeAllMenus()">✏️ Edit</button>
                        <button class="danger" onclick="deletePost('${post.id}'); closeAllMenus()">🗑️ Delete</button>
                    </div>
                </div>`
            : "";

        const categoryLabel = resolveCategoryLabel(post.category_id);
        const highlightedTitle = highlightMatch(post.title || "", query);
        const highlightedContent = highlightMatch(post.content || "", query);
        const highlightedAuthor = highlightMatch(authorName, query);
        const highlightedCategory = highlightMatch(categoryLabel, query);

        return `
            <div class="post-card" id="post-${post.id}">
                ${kebabMenu}
                <div class="post-meta">
                    Posted by <span>${highlightedAuthor}</span> •
                    ${new Date(post.created_at || post.createdAt).toLocaleDateString()}
                    ${categoryLabel ? ` in <b>${highlightedCategory}</b>` : ""}
                </div>
                <h2 class="post-title" id="title-${post.id}">${highlightedTitle}</h2>
                <p class="post-content" id="content-${post.id}">${highlightedContent}</p>
                <div class="post-stats">
                    <button class="stat-btn comment-toggle-btn" onclick="toggleComments('${post.id}')" id="comment-btn-${post.id}">💬 ${post.comments || 0} Comments</button>
                </div>
                <div class="comments-section" id="comments-${post.id}" style="display:none;"></div>
            </div>
        `;
    }).join("");
}

function applySearch() {
    const searchInput = document.getElementById("post-search");
    const islandFilter = document.getElementById("island-filter");
    const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const selectedIsland = islandFilter ? islandFilter.value : "";

    let filtered = allPosts;

    if (selectedIsland) {
        filtered = filtered.filter((post) => getIslandForPost(post) === selectedIsland);
    }

    if (query) {
        filtered = filtered.filter((post) => {
            const authorName = getAuthorName(post).toLowerCase();
            const categoryLabel = resolveCategoryLabel(post.category_id).toLowerCase();
            return (
                authorName.includes(query) ||
                categoryLabel.includes(query) ||
                (post.title || "").toLowerCase().includes(query) ||
                (post.content || "").toLowerCase().includes(query)
            );
        });
    }

    renderPosts(filtered, query);
}

async function loadPosts() {
    const urlParams = new URLSearchParams(window.location.search);
    const nestId = urlParams.get("nest");

    let apiUrl = "/api/posts";
    if (nestId) {
        apiUrl += `?categoryId=${nestId}`;
        const nestName = await resolveNestName(nestId);
        document.getElementById("feed-title").innerText = nestName ? `Viewing: ${nestName}` : `Viewing: ${nestId}`;
    } else {
        await loadNestNameCache();
    }

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        allPosts = data.posts || [];
        applySearch();
    } catch {
        const container = document.getElementById("feed-container");
        if (container) container.innerHTML = `<p style="color: #d94a4a;">Signal lost. Could not fetch posts.</p>`;
    }
}

// ==========================================
// POST KEBAB MENU LOGIC
// ==========================================
window.togglePostMenu = function(postId, event) {
    event.stopPropagation();
    const dropdown = document.getElementById(`dropdown-${postId}`);
    const isOpen = dropdown.classList.contains('open');
    closeAllMenus();
    if (!isOpen) dropdown.classList.add('open');
};

window.closeAllMenus = function() {
    document.querySelectorAll('.post-menu-dropdown.open').forEach(d => d.classList.remove('open'));
};

document.addEventListener('click', window.closeAllMenus);

// ==========================================
// EDIT MODAL LOGIC
// ==========================================
let currentEditPostId = null;

window.openEditModal = function(postId) {
    currentEditPostId = postId;
    const currentText = document.getElementById(`content-${postId}`).innerText;
    document.getElementById("editContent").value = currentText;
    document.getElementById("editModal").style.display = "flex";
};

window.closeEditModal = function() {
    document.getElementById("editModal").style.display = "none";
    currentEditPostId = null;
};

document.getElementById("saveEditBtn").addEventListener("click", async () => {
    if (!currentEditPostId) return;
    const newContent = document.getElementById("editContent").value;
    const saveBtn = document.getElementById("saveEditBtn");
    saveBtn.innerText = "Saving...";

    try {
        const response = await fetch(`/api/posts/${currentEditPostId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: newContent }),
        });

        if (response.ok) {
            document.getElementById(`content-${currentEditPostId}`).innerText = newContent;
            window.closeEditModal();
            showToast("Post updated.", 'success');
        } else {
            showToast("Failed to update post.", 'error');
        }
    } catch {
        showToast("Database connection error.", 'error');
    } finally {
        saveBtn.innerText = "Save Changes";
    }
});

window.deletePost = async function(postId) {
    if (!confirm("Are you sure you want to delete this discovery?")) return;
    try {
        const response = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
        if (response.ok) {
            showToast("Post deleted.", 'info');
            loadPosts();
        } else {
            showToast("Failed to delete post.", 'error');
        }
    } catch {
        showToast("Database connection error.", 'error');
    }
};

// ==========================================
// COMMENTS LOGIC
// ==========================================
const openCommentPanels = new Set();

window.toggleComments = async function(postId) {
    const section = document.getElementById(`comments-${postId}`);
    if (!section) return;

    if (openCommentPanels.has(postId)) {
        section.style.display = 'none';
        openCommentPanels.delete(postId);
        return;
    }

    openCommentPanels.add(postId);
    section.style.display = 'block';
    section.innerHTML = '<p class="comments-loading">Loading comments...</p>';
    await loadComments(postId);
};

async function loadComments(postId) {
    const section = document.getElementById(`comments-${postId}`);
    if (!section) return;

    try {
        const res = await fetch(`/api/posts/${postId}/comments`);
        const data = await res.json();
        const comments = data.comments || [];

        const commentsHtml = comments.length
            ? comments.map(c => `
                <div class="comment-item">
                    <div class="comment-author">🦕 ${escapeHtml(c.authorUsername || c.author_username || 'Explorer')}</div>
                    <div class="comment-body">${escapeHtml(c.content)}</div>
                    <div class="comment-time">${new Date(c.createdAt || c.created_at).toLocaleString()}</div>
                </div>`).join('')
            : '<p class="comments-empty">No comments yet. Be the first to roar!</p>';

        const isLoggedIn = currentUser !== null;
        const inputHtml = isLoggedIn
            ? `<div class="comment-input-row">
                <textarea class="comment-textarea" id="comment-input-${postId}" placeholder="Add a comment..." rows="2"></textarea>
                <button class="comment-submit-btn" onclick="submitComment('${postId}')">Post</button>
               </div>`
            : '<p class="comments-login-hint"><a href="/login/index.html">Log in</a> to comment.</p>';

        section.innerHTML = `<div class="comments-list">${commentsHtml}</div>${inputHtml}`;
    } catch {
        section.innerHTML = '<p class="comments-error">Failed to load comments.</p>';
    }
}

window.submitComment = async function(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    if (!input) return;
    const content = input.value.trim();
    if (!content) return;

    try {
        const res = await fetch(`/api/posts/${postId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content })
        });

        if (res.ok) {
            input.value = '';
            await loadComments(postId);
            const post = allPosts.find(p => p.id === postId);
            if (post) {
                post.comments = (post.comments || 0) + 1;
                const btn = document.getElementById(`comment-btn-${postId}`);
                if (btn) btn.textContent = `💬 ${post.comments} Comments`;
            }
        } else {
            const err = await res.json();
            showToast(err.error || 'Failed to post comment.', 'error');
        }
    } catch {
        showToast('Network error.', 'error');
    }
};

// ==========================================
// 2. LIVE CHAT LOGIC
// ==========================================
async function loadChat() {
    const chatArea = document.getElementById("chat-area");
    const isScrolledToBottom = chatArea.scrollHeight - chatArea.clientHeight <= chatArea.scrollTop + 10;

    try {
        const response = await fetch("/api/chat");
        const data = await response.json();

        if (data.messages && data.messages.length > 0) {
            chatArea.innerHTML = data.messages.map(msg =>
                `<div class="chat-msg"><b>${msg.username || msg.userId}:</b> ${msg.message}</div>`
            ).join("");

            if (isScrolledToBottom) chatArea.scrollTop = chatArea.scrollHeight;
        } else {
            chatArea.innerHTML = '<div class="chat-msg"><i>Welcome to Campusaurus! Be the first to roar.</i></div>';
        }
    } catch { /* silent */ }
}

function setupLiveChat() {
    const chatInput = document.getElementById("chat-input");
    const chatArea = document.getElementById("chat-area");

    chatInput.addEventListener("keypress", async function(e) {
        if (e.key === "Enter" && this.value.trim() !== "") {
            const messageText = this.value.trim();
            this.value = "";

            try {
                const response = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: messageText }),
                });

                if (response.ok) {
                    await loadChat();
                    chatArea.scrollTop = chatArea.scrollHeight;
                }
            } catch {
                showToast("Chat connection lost. Message not sent.", 'error');
            }
        }
    });

    loadChat();
    setInterval(loadChat, 5000);
}

// ==========================================
// INITIALIZE PAGE
// ==========================================
async function initPage() {
    currentUser = await loadCurrentUser();
    await loadPosts();
    setupLiveChat();

    const searchInput = document.getElementById("post-search");
    if (searchInput) searchInput.addEventListener("input", applySearch);

    const islandFilter = document.getElementById("island-filter");
    if (islandFilter) islandFilter.addEventListener("change", applySearch);
}

document.addEventListener("DOMContentLoaded", initPage);