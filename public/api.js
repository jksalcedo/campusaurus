// Centralized API helper for all frontend pages.
//
// Goal: collaborators should only call simple functions (no fetch/URLs sprinkled in HTML files).
//
// Usage in any page:
//   <script type="module">
//     import { CampusaurusAPI } from './api.js';
//     const { announcements } = await CampusaurusAPI.announcements.list();
//   </script>

/** @typedef {{ id: string, title: string, body: string, createdAt: string }} Announcement */
/** @typedef {{ id: string, title: string, content: string, authorId: string, createdAt: string, likes: number }} Post */
/** @typedef {{ id: string, username: string, avatarUrl?: string, bio?: string }} Profile */

const API_BASE_URL = ""; // same-origin (Express serves the frontend)

class ApiError extends Error {
    /** @param {number} status */
    constructor(status, message) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

/** @param {string} path */
function url(path) {
    return `${API_BASE_URL}${path}`;
}

async function requestJson(path, options = {}) {
    const res = await fetch(url(path), {
        headers: {
            Accept: "application/json",
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...(options.headers || {})
        },
        ...options
    });

    if (!res.ok) {
        let errorMessage = `Request failed: ${res.status} ${res.statusText}`;
        try {
            const errorData = await res.json();
            if (errorData && errorData.error) {
                errorMessage = errorData.error;
            } else if (errorData && errorData.message) {
                errorMessage = errorData.message;
            }
        } catch (e) {
            // Not JSON, try text
            const text = await res.text().catch(() => "");
            if (text) errorMessage += ` - ${text}`;
        }
        throw new ApiError(res.status, errorMessage);
    }

    // 204 No Content => return null
    if (res.status === 204) return null;

    return res.json();
}

async function requestText(path, options = {}) {
    const res = await fetch(url(path), options);
    if (!res.ok) {
        let errorMessage = `Request failed: ${res.status} ${res.statusText}`;
        try {
            const errorData = await res.json();
            if (errorData && errorData.error) {
                errorMessage = errorData.error;
            } else if (errorData && errorData.message) {
                errorMessage = errorData.message;
            }
        } catch (e) {
            // Not JSON, try text
            const text = await res.text().catch(() => "");
            if (text) errorMessage += ` - ${text}`;
        }
        throw new ApiError(res.status, errorMessage);
    }
    return res.text();
}

/**
 * The one object collaborators should use.
 * Keep these function signatures stable.
 */
export const CampusaurusAPI = {
    // --- Base & Health ---
    health() {
        return requestJson("/api/health");
    },
    
    /** @returns {Promise<Profile | null>} Current logged-in user or null */
    me() {
        return requestJson("/api/me").catch(() => null);
    },

    // --- Auth ---
    auth: {
        register(email, password, username) {
            return requestJson("/api/auth/register", { method: "POST", body: JSON.stringify({ email, password, username }) });
        },
        login(email, password) {
            return requestJson("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
        },
        logout() {
            return requestJson("/api/auth/logout", { method: "POST" });
        }
    },

    // --- Announcements ---
    announcements: {
        /** @returns {Promise<{ announcements: Announcement[] }>} */
        list() {
            return requestJson("/api/announcements");
        },
        /** @param {{ title: string, body: string }} input */
        create(input) {
            return requestJson("/api/announcements", { method: "POST", body: JSON.stringify(input) });
        },
        /** @param {string} id */
        get(id) {
            return requestJson(`/api/announcements/${encodeURIComponent(id)}`);
        },
        /** @param {string} id @param {{ title?: string, body?: string }} patch */
        update(id, patch) {
            return requestJson(`/api/announcements/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(patch) });
        },
        /** @param {string} id */
        remove(id) {
            return requestJson(`/api/announcements/${encodeURIComponent(id)}`, { method: "DELETE" });
        }
    },

    // --- Posts / Feed ---
    posts: {
        /** @param {{ sort?: string, limit?: number, cursor?: string, category?: string }} query */
        list(query = {}) {
            const params = new URLSearchParams(query).toString();
            const qs = params ? `?${params}` : '';
            return requestJson(`/api/posts${qs}`);
        },
        /** @param {{ title: string, content: string, categoryId?: string }} input */
        create(input) {
            return requestJson("/api/posts", { method: "POST", body: JSON.stringify(input) });
        },
        /** @param {string} id */
        get(id) {
            return requestJson(`/api/posts/${encodeURIComponent(id)}`);
        },
        /** @param {string} id @param {{ title?: string, content?: string }} patch */
        update(id, patch) {
            return requestJson(`/api/posts/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(patch) });
        },
        /** @param {string} id */
        remove(id) {
            return requestJson(`/api/posts/${encodeURIComponent(id)}`, { method: "DELETE" });
        },
        // Post Interactions
        like(id) {
            return requestJson(`/api/posts/${encodeURIComponent(id)}/like`, { method: "POST" });
        },
        unlike(id) {
            return requestJson(`/api/posts/${encodeURIComponent(id)}/like`, { method: "DELETE" });
        },
        getComments(id) {
            return requestJson(`/api/posts/${encodeURIComponent(id)}/comments`);
        },
        addComment(id, text) {
            return requestJson(`/api/posts/${encodeURIComponent(id)}/comments`, { method: "POST", body: JSON.stringify({ text }) });
        }
    },

    // --- Categories / Islands ---
    categories: {
        list() {
            return requestJson("/api/categories");
        },
        /** @param {string} slug */
        get(slug) {
            return requestJson(`/api/categories/${encodeURIComponent(slug)}`);
        },
        /** @param {string} slug */
        getPosts(slug) {
            return requestJson(`/api/categories/${encodeURIComponent(slug)}/posts`);
        }
    },

    // --- Profile ---
    profile: {
        get() {
            return requestJson("/api/profile");
        },
        /** @param {{ bio?: string, username?: string }} patch */
        update(patch) {
            return requestJson("/api/profile", { method: "PATCH", body: JSON.stringify(patch) });
        },
        /** @param {string} userId */
        getPublic(userId) {
            return requestJson(`/api/users/${encodeURIComponent(userId)}`);
        }
    },

    // --- Wordle ---
    wordle: {
        daily() {
            return requestJson("/api/wordle/daily");
        },
        /** @param {{ guess: string }} input */
        submitGuess(input) {
            return requestJson("/api/wordle/guess", { method: "POST", body: JSON.stringify(input) });
        },
        stats() {
            return requestJson("/api/wordle/stats");
        },
        leaderboard() {
            return requestJson("/api/wordle/leaderboard");
        }
    },
    // --- Islands & Nests ---
    islands: {
        /** @returns {Promise<{ stats: Record<string, number> }>} */
        stats() {
            return requestJson("/api/islands/stats");
        },
        /** @param {string} islandId */
        getNests(islandId) {
            return requestJson(`/api/islands/${encodeURIComponent(islandId)}/nests`);
        },
        /** @param {{ islandId: string, name: string, description: string }} input */
        createNest(input) {
            return requestJson("/api/islands/nests", { method: "POST", body: JSON.stringify(input) });
        }
    },

    // Escape hatch for quick experiments
    _raw: {
        json: requestJson,
        text: requestText
    }
};

// Backwards compatibility for pages that import { Api }
export const Api = {
    getAnnouncements: CampusaurusAPI.announcements.list
};