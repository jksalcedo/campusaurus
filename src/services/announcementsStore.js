/**
 * In-memory announcements store.
 * Swap this with a DB later (SQLite/Postgres/etc) without changing routes.
 */

/** @typedef {{ id: string, title: string, body: string, createdAt: string }} Announcement */

/** @type {Map<string, Announcement>} */
const announcements = new Map();

function newId() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    }

    export function listAnnouncements() {
    return Array.from(announcements.values()).sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt)
    );
    }

    export function createAnnouncement({ title, body }) {
    const item = {
        id: newId(),
        title,
        body,
        createdAt: new Date().toISOString()
    };
    announcements.set(item.id, item);
    return item;
    }

    export function getAnnouncement(id) {
    return announcements.get(id) ?? null;
    }

    export function updateAnnouncement(id, patch) {
    const existing = announcements.get(id);
    if (!existing) return null;

    const updated = {
        ...existing,
        ...(patch.title !== undefined ? { title: patch.title } : null),
        ...(patch.body !== undefined ? { body: patch.body } : null)
    };

    announcements.set(id, updated);
    return updated;
    }

    export function deleteAnnouncement(id) {
    return announcements.delete(id);
}
