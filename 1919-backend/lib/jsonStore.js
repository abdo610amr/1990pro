import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");

const FILES = {
  products: "products.json",
  orders: "orders.json",
  promos: "promos.json",
  reviews: "reviews.json",
  categories: "categories.json",
  users: "users.json",
  brands: "brands.json",
  notificationLog: "notification-log.json",
  homepageCarousel: "homepage-carousel.json",
};

const DOCUMENT_FILES = {
  popup: "popup.json",
  announcement: "announcement.json",
  platform: "platform.json",
  notifications: "notifications.json",
};

const fileLocks = new Map();

async function withLock(fileKey, fn) {
  let prevPromise = fileLocks.get(fileKey) || Promise.resolve();
  let release;
  const nextPromise = new Promise((resolve) => {
    release = resolve;
  });
  fileLocks.set(fileKey, prevPromise.then(() => nextPromise));

  try {
    await prevPromise;
    return await fn();
  } finally {
    release();
  }
}

export async function readCollection(name) {
  const fileKey = FILES[name] || name;
  return withLock(fileKey, async () => {
    const filePath = path.join(DATA_DIR, FILES[name]);
    try {
      const content = await fs.readFile(filePath, "utf-8");
      return JSON.parse(content);
    } catch (err) {
      if (err.code === "ENOENT") return [];
      throw err;
    }
  });
}

export async function writeCollection(name, data) {
  const fileKey = FILES[name] || name;
  return withLock(fileKey, async () => {
    const filePath = path.join(DATA_DIR, FILES[name]);
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tempPath = `${filePath}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(data, null, 2), "utf-8");
    await fs.rename(tempPath, filePath);
  });
}

export async function readDocument(name, defaults = null) {
  const fileName = DOCUMENT_FILES[name];
  if (!fileName) throw new Error(`Unknown document: ${name}`);
  return withLock(fileName, async () => {
    const filePath = path.join(DATA_DIR, fileName);
    try {
      const content = await fs.readFile(filePath, "utf-8");
      return JSON.parse(content);
    } catch (err) {
      if (err.code === "ENOENT") return defaults;
      throw err;
    }
  });
}

export async function writeDocument(name, data) {
  const fileName = DOCUMENT_FILES[name];
  if (!fileName) throw new Error(`Unknown document: ${name}`);
  return withLock(fileName, async () => {
    const filePath = path.join(DATA_DIR, fileName);
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tempPath = `${filePath}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(data, null, 2), "utf-8");
    await fs.rename(tempPath, filePath);
  });
}

export function getNextId(items) {
  if (!items.length) return 1;
  return Math.max(...items.map((item) => Number(item.id) || 0)) + 1;
}

export function parseJsonField(value, fallback = []) {
  if (value == null) return fallback;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}
