/**
 * JsonStorageProvider — JSON file-based storage engine.
 *
 * Wraps the existing lib/jsonStore.js helpers without modifying them.
 * Returns thin repository-compatible wrappers that delegate to
 * readCollection / writeCollection / readDocument / writeDocument.
 *
 * This class does NOT create full repository implementations yet —
 * those belong in each feature module (e.g. modules/users/json/).
 * It provides the low-level read/write primitives that module
 * repositories will use.
 *
 * When we migrate to PostgreSQL, a PostgresStorageProvider will
 * replace this class and module repositories will swap their
 * Json* implementations for Pg* implementations.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { StorageProvider } from "./StorageProvider.js";
import {
  readCollection,
  writeCollection,
  readDocument,
  writeDocument,
  getNextId,
} from "../../lib/jsonStore.js";
import { ensureUploadDirs } from "../../lib/fileStorage.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "..", "data");

const COLLECTION_FILES = {
  products: "products.json",
  orders: "orders.json",
  promos: "promos.json",
  reviews: "reviews.json",
  categories: "categories.json",
  users: "users.json",
  brands: "brands.json",
  notificationLog: "notification-log.json",
  auditLog: "audit-log.json",
  audit: "audit-log.json",
  shifts: "shifts.json",
  cashMovements: "cash-movements.json",
  inventoryTransactions: "inventory-transactions.json",
};

const DOCUMENT_FILES = {
  popup: "popup.json",
  announcement: "announcement.json",
  platform: "platform.json",
  notifications: "notifications.json",
  settings: "settings.json",
};

/** Per-file write queue to prevent concurrent write race conditions. */
const fileWriteQueues = new Map();

function enqueueFileWrite(filePath, writeOperation) {
  const current = fileWriteQueues.get(filePath) || Promise.resolve();
  const next = current.then(writeOperation, writeOperation);
  fileWriteQueues.set(filePath, next);
  return next;
}

export class JsonStorageProvider extends StorageProvider {
  constructor() {
    super();
    /** @type {Map<string, object>} Cached repository instances. */
    this._repositories = new Map();
  }

  /**
   * Helper to safely read a JSON collection file.
   */
  async _readJsonFile(fileName) {
    const filePath = path.join(DATA_DIR, fileName);
    try {
      const content = await fs.readFile(filePath, "utf-8");
      return JSON.parse(content);
    } catch (err) {
      if (err.code === "ENOENT") return [];
      throw err;
    }
  }

  /**
   * Helper to atomically write a JSON file with write queueing.
   */
  async _writeJsonFile(fileName, data) {
    const filePath = path.join(DATA_DIR, fileName);
    return enqueueFileWrite(filePath, async () => {
      const tempPath = `${filePath}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
      const content = JSON.stringify(data, null, 2);
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(tempPath, content, "utf-8");
      await fs.rename(tempPath, filePath);
    });
  }

  /**
   * Ensure data directory and default files exist.
   */
  async initialize() {
    await ensureUploadDirs();
    await fs.mkdir(DATA_DIR, { recursive: true });

    const collectionsToEnsure = [
      "audit-log.json",
      "shifts.json",
      "cash-movements.json",
      "inventory-transactions.json",
    ];

    for (const fileName of collectionsToEnsure) {
      const filePath = path.join(DATA_DIR, fileName);
      try {
        await fs.access(filePath);
      } catch {
        await fs.writeFile(filePath, "[]\n", "utf-8");
      }
    }

    const settingsPath = path.join(DATA_DIR, "settings.json");
    try {
      await fs.access(settingsPath);
    } catch {
      await fs.writeFile(settingsPath, "{}\n", "utf-8");
    }
  }

  /**
   * JSON files need no cleanup.
   */
  async close() {
    this._repositories.clear();
  }

  /**
   * Return the low-level storage helpers for a named collection/document.
   *
   * @param {string} name  Collection or document name.
   * @returns {object} An accessor with read/write helpers.
   */
  getRepository(name) {
    if (this._repositories.has(name)) {
      return this._repositories.get(name);
    }

    const fileName = COLLECTION_FILES[name];
    const docName = DOCUMENT_FILES[name];

    const accessor = {
      name,
      readAll: async () => {
        if (fileName) {
          // If jsonStore knows about it, use readCollection, else fallback to _readJsonFile
          try {
            return await readCollection(name);
          } catch {
            return await this._readJsonFile(fileName);
          }
        }
        return [];
      },
      writeAll: async (data) => {
        if (fileName) {
          try {
            await writeCollection(name, data);
          } catch {
            await this._writeJsonFile(fileName, data);
          }
        }
      },
      getNextId: (items) => getNextId(items),
      readDocument: async () => {
        if (docName) {
          try {
            return await readDocument(name, {});
          } catch {
            const filePath = path.join(DATA_DIR, docName);
            try {
              const content = await fs.readFile(filePath, "utf-8");
              return JSON.parse(content);
            } catch {
              return {};
            }
          }
        }
        return {};
      },
      writeDocument: async (data) => {
        if (docName) {
          try {
            await writeDocument(name, data);
          } catch {
            const filePath = path.join(DATA_DIR, docName);
            await fs.mkdir(DATA_DIR, { recursive: true });
            await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
          }
        }
      },
    };

    this._repositories.set(name, accessor);
    return accessor;
  }
}

