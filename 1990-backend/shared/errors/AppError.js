/**
 * AppError — Structured application error hierarchy.
 *
 * Every service throws these instead of plain Error objects.
 * Routes catch them and return consistent API error responses.
 *
 * Custom error classes enable centralized error handling
 * without string matching or status-code guessing.
 */

export class AppError extends Error {
  /**
   * @param {string} message   Human-readable error message.
   * @param {number} [status=500]  HTTP status code.
   * @param {string} [code]    Machine-readable error code (e.g. "USER_NOT_FOUND").
   * @param {object} [details] Additional context (validation errors, etc.).
   */
  constructor(message, status = 500, code = "INTERNAL_ERROR", details = null) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /** Serialize for API response. */
  toJSON() {
    return {
      error: true,
      code: this.code,
      message: this.message,
      ...(this.details ? { details: this.details } : {}),
    };
  }
}

// ─────────────────────────────────────────────────────────────
// Specific error types
// ─────────────────────────────────────────────────────────────

/** 400 — The request payload is invalid. */
export class ValidationError extends AppError {
  constructor(message = "Validation failed", details = null) {
    super(message, 400, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
  }
}

/** 401 — No valid credentials provided. */
export class AuthenticationError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "AUTHENTICATION_ERROR");
    this.name = "AuthenticationError";
  }
}

/** 403 — Authenticated but lacking permission. */
export class AuthorizationError extends AppError {
  constructor(message = "Insufficient permissions", details = null) {
    super(message, 403, "AUTHORIZATION_ERROR", details);
    this.name = "AuthorizationError";
  }
}

/** 404 — Entity not found. */
export class NotFoundError extends AppError {
  constructor(entity = "Resource", id = null) {
    const message = id ? `${entity} #${id} not found` : `${entity} not found`;
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
    this.entity = entity;
  }
}

/** 409 — Conflicting state (e.g. duplicate username). */
export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, 409, "CONFLICT");
    this.name = "ConflictError";
  }
}

/** 423 — Account is temporarily locked. */
export class AccountLockedError extends AppError {
  constructor(lockedUntil = null) {
    const message = lockedUntil
      ? `Account locked until ${lockedUntil}`
      : "Account is temporarily locked";
    super(message, 423, "ACCOUNT_LOCKED", { locked_until: lockedUntil });
    this.name = "AccountLockedError";
  }
}

/** 422 — Business rule violation (e.g. discount exceeds limit). */
export class BusinessRuleError extends AppError {
  constructor(message, details = null) {
    super(message, 422, "BUSINESS_RULE_VIOLATION", details);
    this.name = "BusinessRuleError";
  }
}
