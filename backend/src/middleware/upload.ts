import multer from "multer";
import path from "path";
import fs from "fs";
import { env } from "../config/env";

const UPLOAD_DIR = path.join(__dirname, "..", "..", "storage", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_EXTENSIONS = new Set([".eml", ".txt", ".msg"]);
const ALLOWED_MIME_TYPES = new Set([
  "message/rfc822",
  "text/plain",
  "application/octet-stream", // some browsers report .eml this way
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname)}`;
    cb(null, safeName);
  },
});

export const uploadEmailFile = multer({
  storage,
  limits: { fileSize: env.maxUploadMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext) && !ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(new Error("Unsupported file type. Only .eml, .msg, or raw text email files are accepted."));
    }
    // Uploaded files are untrusted: never executed, only parsed as text/MIME.
    cb(null, true);
  },
});
