// ==========================================
// 1. FEED & CRUD LOGIC
// ==========================================
let currentUser = null;
let nestNameCache = null;

async function loadCurrentUser() {
  try {
    const response = await fetch("/api/me");
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    return null;
  }
}

function canEditPost(post, user) {
  if (!user) return false;
  const isAdmin = user.isAdmin || user.is_admin;
  const authorId = post.authorId || post.author_id;
  return isAdmin || authorId === user.id;
}

async function loadNestNameCache() {
  if (nestNameCache) return nestNameCache;
  try {
    const response = await fetch("/api/nests");
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.nests || data.nests.length === 0) return null;
    nestNameCache = new Map(data.nests.map((nest) => [nest.id, nest.name]));
    return nestNameCache;
  } catch (error) {
    return null;
  }
}

async function resolveNestName(nestId) {
  if (!nestId) return null;
  const cache = await loadNestNameCache();
  if (!cache) return null;
  return cache.get(nestId) || null;
}

function resolveCategoryLabel(categoryId) {
  if (!categoryId) return "";
  if (nestNameCache && nestNameCache.has(categoryId)) {
    return nestNameCache.get(categoryId);
  }
  return categoryId;
}

async function loadPosts() {
  const container = document.getElementById("feed-container");
  const urlParams = new URLSearchParams(window.location.search);
  const nestId = urlParams.get("nest");

  let apiUrl = "/api/posts";
  if (nestId) {
    apiUrl += `?categoryId=${nestId}`;
    const nestName = await resolveNestName(nestId);
    document.getElementById("feed-title").innerText = nestName
      ? `Viewing: ${nestName}`
      : `Viewing: ${nestId}`;
  } else {
    await loadNestNameCache();
  }

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.posts && data.posts.length > 0) {
      container.innerHTML = data.posts
        .map((post) => {
          const authorName =
            post.authorUsername ||
            post.author_username ||
            post.author ||
            post.author_id ||
            "Explorer";
          const showActions = canEditPost(post, currentUser);
          const actionsHtml = showActions
            ? `
                        <button onclick="openEditModal('${post.id}')" style="background:transparent; border:none; color:var(--amber-accent); cursor:pointer; font-weight:bold;">[ Edit ]</button>
                        <button onclick="deletePost('${post.id}')" style="background:transparent; border:none; color:#d94a4a; cursor:pointer; font-weight:bold;">[ Delete ]</button>
                `
            : "";

          const categoryLabel = resolveCategoryLabel(post.category_id);

          return `
                <div class="post-card" id="post-${post.id}">
                    <div class="post-meta">
                        Posted by <span>${authorName}</span> •
                        ${new Date(post.created_at || post.createdAt).toLocaleDateString()}
                        ${categoryLabel ? ` in <b>${categoryLabel}</b>` : ""}
                    </div>
                    <h2 class="post-title" id="title-${post.id}">${post.title}</h2>
                    <p class="post-content" id="content-${post.id}">${post.content || ""}</p>

                    <div class="post-stats">
                        <span class="stat-btn">💬 ${post.comments || 0} Comments</span>
                        ${actionsHtml}
                    </div>
                </div>
            `;
        })
        .join("");
    } else {
      container.innerHTML = `<p style="color: var(--text-muted); font-style: italic;">No discoveries have been logged yet.</p>`;
    }
  } catch (error) {
    container.innerHTML = `<p style="color: #d94a4a;">Signal lost. Could not fetch posts.</p>`;
  }
}

// --- NEW MODAL LOGIC ---
let currentEditPostId = null;

function openEditModal(postId) {
  currentEditPostId = postId;
  // Get the current text from the UI
  const currentText = document.getElementById(`content-${postId}`).innerText;
  document.getElementById("editContent").value = currentText;
  document.getElementById("editModal").style.display = "flex";
}

function closeEditModal() {
  document.getElementById("editModal").style.display = "none";
  currentEditPostId = null;
}

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
      document.getElementById(`content-${currentEditPostId}`).innerText =
        newContent;
      closeEditModal();
    } else {
      alert("Failed to update post.");
    }
  } catch (error) {
    alert("Database connection error.");
  } finally {
    saveBtn.innerText = "Save Changes";
  }
});

// DELETE LOGIC
async function deletePost(postId) {
  if (!confirm("Are you sure you want to delete this discovery?")) return;
  try {
    const response = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    if (response.ok) loadPosts();
  } catch (error) {
    alert("Database connection error.");
  }
}

// ==========================================// ==========================================
// 2. LIVE CHAT LOGIC (Database Connected)
// ==========================================
async function loadChat() {
  const chatArea = document.getElementById("chat-area");

  // Remember scroll position to see if user is already at the bottom
  const isScrolledToBottom =
    chatArea.scrollHeight - chatArea.clientHeight <= chatArea.scrollTop + 10;

  try {
    const response = await fetch("/api/chat");
    const data = await response.json();

    if (data.messages && data.messages.length > 0) {
      chatArea.innerHTML = data.messages
        .map(
          (msg) => `
                <div class="chat-msg"><b>${msg.username || msg.userId}:</b> ${msg.message}</div>
            `,
        )
        .join("");

      // Auto-scroll to newest message
      if (isScrolledToBottom) {
        chatArea.scrollTop = chatArea.scrollHeight;
      }
    } else {
      chatArea.innerHTML =
        '<div class="chat-msg"><i>Welcome to Campusaurus! Be the first to roar.</i></div>';
    }
  } catch (err) {
    console.error("Failed to load chat from database.");
  }
}

function setupLiveChat() {
  const chatInput = document.getElementById("chat-input");
  const chatArea = document.getElementById("chat-area");

  chatInput.addEventListener("keypress", async function (e) {
    if (e.key === "Enter" && this.value.trim() !== "") {
      const messageText = this.value.trim();
      this.value = ""; // clear input immediately for snappy UX

      try {
        // Post to Flask backend
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: messageText }),
        });

        if (response.ok) {
          await loadChat(); // Reload chat to show the new message
          chatArea.scrollTop = chatArea.scrollHeight; // Force scroll to bottom
        }
      } catch (err) {
        alert("Database connection lost. Message not sent.");
      }
    }
  });

  // Load messages instantly on page load
  loadChat();

  // Auto-refresh the chat every 5 seconds so it feels "Live"
  setInterval(loadChat, 5000);
}
// 2. LIVE CHAT LOGIC
// ==========================================

// ==========================================
// INITIALIZE PAGE
// ==========================================
async function initPage() {
  currentUser = await loadCurrentUser();
  await loadPosts();
  setupLiveChat();
}

document.addEventListener("DOMContentLoaded", () => {
  initPage();
});
