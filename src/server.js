import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import express from "express";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve the vanilla multi-page frontend
const frontendPublicPath = path.resolve(__dirname, "../public");
app.use(express.static(frontendPublicPath));

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
