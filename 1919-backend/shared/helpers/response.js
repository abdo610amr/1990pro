/**
 * response — Standardized API response helpers.
 *
 * Provides consistent response shapes for success and error cases.
 * Routes use these instead of crafting ad-hoc response objects.
 */

import { AppError } from "../errors/AppError.js";

/**
 * Send a success response.
 *
 * @param {import("express").Response} res
 * @param {object|array} data     Payload to return.
 * @param {number}       [status=200]
 * @param {string}       [message]  Optional success message.
 */
export function sendSuccess(res, data, status = 200, message = undefined) {
  const body = { success: true };
  if (message) body.message = message;
  if (data !== undefined) body.data = data;
  res.status(status).json(body);
}

/**
 * Send a created (201) response.
 *
 * @param {import("express").Response} res
 * @param {object} data
 * @param {string} [message="Created successfully"]
 */
export function sendCreated(res, data, message = "Created successfully") {
  sendSuccess(res, data, 201, message);
}

/**
 * Send an error response from an AppError or unknown error.
 *
 * @param {import("express").Response} res
 * @param {Error} error
 */
export function sendError(res, error) {
  if (error instanceof AppError) {
    return res.status(error.status).json(error.toJSON());
  }

  console.error("[Unhandled Error]", error);
  res.status(500).json({
    error: true,
    code: "INTERNAL_ERROR",
    message: "An unexpected error occurred",
  });
}

/**
 * Wrap an async route handler to catch errors automatically.
 * Replaces the need for try/catch in every route.
 *
 * Usage:
 *   router.get("/", asyncHandler(async (req, res) => { ... }));
 *
 * @param {Function} fn  Async route handler.
 * @returns {Function}
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      sendError(res, error);
    });
  };
}
