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
};

const DOCUMENT_FILES = {
  popup: "popup.json",
  announcement: "announcement.json",
  platform: "platform.json",
  notifications: "notifications.json",
};

export async function readCollection(name) {
  const filePath = path.join(DATA_DIR, FILES[name]);
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

export async function writeCollection(name, data) {
  const filePath = path.join(DATA_DIR, FILES[name]);
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function readDocument(name, defaults = null) {
  const fileName = DOCUMENT_FILES[name];
  if (!fileName) throw new Error(`Unknown document: ${name}`);
  const filePath = path.join(DATA_DIR, fileName);
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    if (err.code === "ENOENT") return defaults;
    throw err;
  }
}

export async function writeDocument(name, data) {
  const fileName = DOCUMENT_FILES[name];
  if (!fileName) throw new Error(`Unknown document: ${name}`);
  const filePath = path.join(DATA_DIR, fileName);
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
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
