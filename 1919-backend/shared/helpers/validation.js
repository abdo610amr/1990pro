/**
 * validation — Input validation helpers.
 *
 * Lightweight validators for common field types.
 * Used by route-level validators and service pre-checks.
 *
 * These are intentionally simple — no external validation library
 * required. If the project later adopts Joi or Zod, these can
 * be replaced or wrapped.
 */

import { ValidationError } from "../errors/AppError.js";

/**
 * Assert that a value is a non-empty string.
 *
 * @param {unknown} value
 * @param {string} fieldName
 * @returns {string} The trimmed string.
 * @throws {ValidationError}
 */
export function requireString(value, fieldName) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ValidationError(`${fieldName} is required and must be a non-empty string`);
  }
  return value.trim();
}

/**
 * Assert that a value is a positive number.
 *
 * @param {unknown} value
 * @param {string} fieldName
 * @returns {number}
 * @throws {ValidationError}
 */
export function requirePositiveNumber(value, fieldName) {
  const num = Number(value);
  if (Number.isNaN(num) || num < 0) {
    throw new ValidationError(`${fieldName} must be a non-negative number`);
  }
  return num;
}

/**
 * Assert that a value is a positive integer.
 *
 * @param {unknown} value
 * @param {string} fieldName
 * @returns {number}
 * @throws {ValidationError}
 */
export function requirePositiveInt(value, fieldName) {
  const num = Number(value);
  if (!Number.isInteger(num) || num < 1) {
    throw new ValidationError(`${fieldName} must be a positive integer`);
  }
  return num;
}

/**
 * Assert that a value is one of the allowed values.
 *
 * @param {unknown} value
 * @param {unknown[]} allowed
 * @param {string} fieldName
 * @returns {unknown} The validated value.
 * @throws {ValidationError}
 */
export function requireEnum(value, allowed, fieldName) {
  if (!allowed.includes(value)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${allowed.join(", ")}`
    );
  }
  return value;
}

/**
 * Validate an email address (basic RFC-compliant regex).
 *
 * @param {unknown} value
 * @param {string} [fieldName="email"]
 * @returns {string} The lowercased email.
 * @throws {ValidationError}
 */
export function requireEmail(value, fieldName = "email") {
  const str = requireString(value, fieldName);
  const email = str.toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ValidationError(`${fieldName} is not a valid email address`);
  }
  return email;
}

/**
 * Validate optional email — returns null if empty/undefined.
 *
 * @param {unknown} value
 * @param {string} [fieldName="email"]
 * @returns {string|null}
 * @throws {ValidationError}
 */
export function optionalEmail(value, fieldName = "email") {
  if (value === undefined || value === null || value === "") return null;
  return requireEmail(value, fieldName);
}

/**
 * Validate a password meets minimum length.
 *
 * @param {unknown} value
 * @param {number} [minLength=6]
 * @param {string} [fieldName="password"]
 * @returns {string}
 * @throws {ValidationError}
 */
export function requirePassword(value, minLength = 6, fieldName = "password") {
  const str = requireString(value, fieldName);
  if (str.length < minLength) {
    throw new ValidationError(
      `${fieldName} must be at least ${minLength} characters`
    );
  }
  return str;
}

/**
 * Validate that a number is within a range (inclusive).
 *
 * @param {unknown} value
 * @param {number} min
 * @param {number} max
 * @param {string} fieldName
 * @returns {number}
 * @throws {ValidationError}
 */
export function requireNumberInRange(value, min, max, fieldName) {
  const num = Number(value);
  if (Number.isNaN(num) || num < min || num > max) {
    throw new ValidationError(
      `${fieldName} must be a number between ${min} and ${max}`
    );
  }
  return num;
}

/**
 * Validate and sanitize a username.
 * Allowed: letters, numbers, underscores, dots. Min 3, max 30 chars.
 *
 * @param {unknown} value
 * @param {string} [fieldName="username"]
 * @returns {string} Lowercased username.
 * @throws {ValidationError}
 */
export function requireUsername(value, fieldName = "username") {
  const str = requireString(value, fieldName).toLowerCase();
  if (str.length < 3 || str.length > 30) {
    throw new ValidationError(`${fieldName} must be 3–30 characters`);
  }
  if (!/^[a-z0-9_.]+$/.test(str)) {
    throw new ValidationError(
      `${fieldName} can only contain letters, numbers, underscores, and dots`
    );
  }
  return str;
}
