/**
 * uuid — UUID v4 generation without external dependencies.
 *
 * Uses Node.js built-in crypto.randomUUID() (available since v19).
 * Falls back to manual generation for older runtimes.
 */

import crypto from "node:crypto";

/**
 * Generate a v4 UUID.
 *
 * @returns {string} e.g. "a1b2c3d4-e5f6-4789-abcd-ef0123456789"
 */
export function generateUuid() {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  // Manual fallback for Node.js < 19
  const bytes = crypto.randomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant RFC 4122

  const hex = bytes.toString("hex");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-");
}

/**
 * Validate a UUID v4 string.
 *
 * @param {string} value
 * @returns {boolean}
 */
export function isValidUuid(value) {
  if (typeof value !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}
