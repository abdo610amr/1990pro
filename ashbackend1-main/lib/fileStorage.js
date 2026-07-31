import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");

export async function saveUploadedFile(buffer, folder, originalName) {
  const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const fileName = `${Date.now()}-${safeName}`;
  const dir = path.join(UPLOADS_DIR, folder);

  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, fileName), buffer);

  return `http://localhost:5000/uploads/${folder}/${fileName}`;
}

export async function ensureUploadDirs() {
  await fs.mkdir(path.join(UPLOADS_DIR, "products"), { recursive: true });
  await fs.mkdir(path.join(UPLOADS_DIR, "payments"), { recursive: true });
  await fs.mkdir(path.join(UPLOADS_DIR, "popup"), { recursive: true });
}
