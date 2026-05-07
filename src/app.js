import express from "express";
import cors from "cors";
import announcementsRoutes from "./routes/announcementsRoutes.js";
import { createNotImplementedRouter } from "./routes/stubsRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// Implemented features
app.use("/api/announcements", announcementsRoutes);

// Stubs for future features (keeps frontend API client stable)
app.use("/api/me", createNotImplementedRouter("me"));
app.use("/api/auth", createNotImplementedRouter("auth"));
app.use("/api/posts", createNotImplementedRouter("posts"));
app.use("/api/categories", createNotImplementedRouter("categories"));
app.use("/api/profile", createNotImplementedRouter("profile"));
app.use("/api/users", createNotImplementedRouter("users"));
app.use("/api/wordle", createNotImplementedRouter("wordle"));

export default app;
