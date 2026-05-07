import {
    listAnnouncements,
    createAnnouncement,
    getAnnouncement,
    updateAnnouncement,
    deleteAnnouncement
    } from "../services/announcementsStore.js";

    function asNonEmptyString(v) {
    return typeof v === "string" && v.trim() ? v.trim() : "";
    }

    export async function list(_req, res) {
        res.json({ announcements: await listAnnouncements() });
    }

    export function create(req, res) {
    const title = asNonEmptyString(req.body?.title);
    const body = asNonEmptyString(req.body?.body);

    if (!title || !body) {
        return res.status(400).json({ error: "title and body are required" });
    }

    const item = createAnnouncement({ title, body });
    return res.status(201).json(item);
    }

    export function get(req, res) {
    const item = getAnnouncement(req.params.id);
    if (!item) return res.status(404).json({ error: "not found" });
    return res.json(item);
    }

    export function update(req, res) {
    const patch = {};

    if (req.body?.title !== undefined) {
        const title = asNonEmptyString(req.body.title);
        if (!title) return res.status(400).json({ error: "title cannot be empty" });
        patch.title = title;
    }

    if (req.body?.body !== undefined) {
        const body = asNonEmptyString(req.body.body);
        if (!body) return res.status(400).json({ error: "body cannot be empty" });
        patch.body = body;
    }

    const updated = updateAnnouncement(req.params.id, patch);
    if (!updated) return res.status(404).json({ error: "not found" });
    return res.json(updated);
    }

    export function remove(req, res) {
    const ok = deleteAnnouncement(req.params.id);
    if (!ok) return res.status(404).json({ error: "not found" });
    return res.status(204).send();
}
