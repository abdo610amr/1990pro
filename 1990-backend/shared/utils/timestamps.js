/**
 * timestamps — ISO 8601 timestamp helpers.
 *
 * Database-first design requires every entity to carry:
 *   created_at, updated_at, deleted_at
 *
 * These helpers centralize timestamp generation so format
 * is consistent across all repositories and services.
 */

/**
 * Current UTC timestamp in ISO 8601 format.
 *
 * @returns {string} e.g. "2026-08-05T10:00:00.000Z"
 */
export function now() {
  return new Date().toISOString();
}

/**
 * Return base timestamp fields for a new entity.
 *
 * @returns {{ created_at: string, updated_at: string, deleted_at: null }}
 */
export function createdTimestamps() {
  const ts = now();
  return {
    created_at: ts,
    updated_at: ts,
    deleted_at: null,
  };
}

/**
 * Return updated timestamp for an entity mutation.
 *
 * @returns {{ updated_at: string }}
 */
export function updatedTimestamp() {
  return { updated_at: now() };
}

/**
 * Return soft-delete timestamp.
 *
 * @returns {{ deleted_at: string, updated_at: string }}
 */
export function deletedTimestamp() {
  const ts = now();
  return { deleted_at: ts, updated_at: ts };
}

/**
 * Check if an entity is soft-deleted.
 *
 * @param {object} record
 * @returns {boolean}
 */
export function isDeleted(record) {
  return record?.deleted_at != null;
}

/**
 * Parse an ISO 8601 string to a Date.
 * Returns null if the input is falsy or invalid.
 *
 * @param {string|null|undefined} value
 * @returns {Date|null}
 */
export function parseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Check if two ISO dates fall on the same calendar day (UTC).
 *
 * @param {string} isoA
 * @param {string} isoB
 * @returns {boolean}
 */
export function isSameDay(isoA, isoB) {
  const a = parseDate(isoA);
  const b = parseDate(isoB);
  if (!a || !b) return false;
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

/**
 * Check if an ISO date falls within the current day (UTC).
 *
 * @param {string} iso
 * @returns {boolean}
 */
export function isToday(iso) {
  return isSameDay(iso, now());
}
