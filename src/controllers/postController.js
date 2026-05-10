import {
    listPosts,
    createPost,
    getPost,
    updatePost,
    deletePost
} from "../services/postsStore.js";

function asNonEmptyString(v) {
    return typeof v === "string" && v.trim() ? v.trim() : "";
}

export async function list(_req, res) {
    try {
        const posts = await listPosts();
        res.json({ posts: posts });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function create(req, res) {
    const categoryId = asNonEmptyString(req.body?.categoryId);
    const title = asNonEmptyString(req.body?.title);
    const content = asNonEmptyString(req.body?.content);

    if (!categoryId || !title) {
        return res.status(400).json({ error: "categoryId and title are required" });
    }

    try {
        const item = await createPost({ categoryId, title, content });
        return res.status(201).json(item);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

export async function get(req, res) {
    try {
        const item = await getPost(req.params.id);
        if (!item) return res.status(404).json({ error: "not found" });
        return res.json(item);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

export async function update(req, res) {
    const patch = {};

    if (req.body?.categoryId !== undefined) {
        const categoryId = asNonEmptyString(req.body.categoryId);
        if (!categoryId) return res.status(400).json({ error: "categoryId cannot be empty" });
        patch.categoryId = categoryId;
    }

    if (req.body?.title !== undefined) {
        const title = asNonEmptyString(req.body.title);
        if (!title) return res.status(400).json({ error: "title cannot be empty" });
        patch.title = title;
    }

    if (req.body?.content !== undefined) {
        patch.content = asNonEmptyString(req.body.content);
    }

    try {
        const updated = await updatePost(req.params.id, patch);
        if (!updated) return res.status(404).json({ error: "not found" });
        return res.json(updated);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

export async function remove(req, res) {
    try {
        const ok = await deletePost(req.params.id);
        if (!ok) return res.status(404).json({ error: "not found" });
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}