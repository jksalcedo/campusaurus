import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// --- Announcements (in-memory for now; wire to DB later) ---
/** @typedef {{ id: string, title: string, body: string, createdAt: string }} Announcement */

/** @type {Map<string, Announcement>} */
const announcements = new Map();

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

app.get("/api/announcements", (_req, res) => {
  const list = Array.from(announcements.values()).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
  res.json({ announcements: list });
});

app.post("/api/announcements", (req, res) => {
  const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
  const body = typeof req.body?.body === "string" ? req.body.body.trim() : "";

  if (!title || !body) {
    return res.status(400).json({ error: "title and body are required" });
  }

  const item = {
    id: newId(),
    title,
    body,
    createdAt: new Date().toISOString()
  };

  announcements.set(item.id, item);
  return res.status(201).json(item);
});

app.get("/api/announcements/:id", (req, res) => {
  const item = announcements.get(req.params.id);
  if (!item) return res.status(404).json({ error: "not found" });
  return res.json(item);
});

app.patch("/api/announcements/:id", (req, res) => {
  const item = announcements.get(req.params.id);
  if (!item) return res.status(404).json({ error: "not found" });

  const title = typeof req.body?.title === "string" ? req.body.title.trim() : undefined;
  const body = typeof req.body?.body === "string" ? req.body.body.trim() : undefined;

  const updated = {
    ...item,
    ...(title !== undefined ? { title } : null),
    ...(body !== undefined ? { body } : null)
  };

  announcements.set(updated.id, updated);
  return res.json(updated);
});

app.delete("/api/announcements/:id", (req, res) => {
  const existed = announcements.delete(req.params.id);
  if (!existed) return res.status(404).json({ error: "not found" });
  return res.status(204).send();
});

export default app;
