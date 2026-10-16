import express from "express";
import cors from "cors";
import { existsSync, statSync } from "node:fs";
import api from "./routes/index.js";
import { storageDirectory } from "./services/mediaStorage.service.js";
import multer from "multer";
const app = express();

app.use(cors());
app.use(express.json());
app.use("/media", express.static(storageDirectory, {
  fallthrough: false,
  index: false,
  dotfiles: "deny",
  redirect: false
}));

if (
  storageDirectory &&
  existsSync(storageDirectory) &&
  statSync(storageDirectory).isDirectory()
) {
  app.use("/media", express.static(storageDirectory, {
    fallthrough: false,
    index: false,
    dotfiles: "deny",
    redirect: false
  }));
}

app.use("/api", api);
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running" });
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    const message = error.code === "LIMIT_FILE_SIZE"
      ? "Each image must be 10 MB or smaller"
      : error.code === "LIMIT_FILE_COUNT"
        ? "You can upload up to 20 images at a time"
        : error.message || "Invalid multipart upload";
    return res.status(400).json({ success: false, message });
  }
  if (error) {
    console.error("[HTTP] Unhandled error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
  return next();
});

export default app;
