/**
 * User Validators — Request payload validation routines for User operations.
 */

import {
  requireString,
  requireUsername,
  optionalEmail,
  requirePassword,
  requireEnum,
  requireNumberInRange,
} from "../../shared/helpers/validation.js";
import { getAvailableRoles } from "../../core/rbac.js";
import { USER_STATUS } from "../../shared/constants/index.js";

/**
 * Validate creation of a new staff user.
 *
 * @param {object} input
 * @returns {object} Validated payload
 */
export function validateCreateStaffUser(input) {
  if (!input || typeof input !== "object") {
    throw new Error("Payload must be an object");
  }

  const fullName = requireString(input.full_name || input.fullName, "full_name");
  const username = requireUsername(input.username, "username");
  const email = optionalEmail(input.email, "email");
  const password = requirePassword(input.password, 6, "password");

  const validRoles = getAvailableRoles().map((r) => r.id);
  const role = requireEnum(input.role || "seller", validRoles, "role");

  const maxDiscount = requireNumberInRange(
    input.max_discount ?? input.maxDiscount ?? 0,
    0,
    100,
    "max_discount"
  );

  return {
    full_name: fullName,
    username,
    email: email || `${username}@1990.store`, // default fallback email if none provided
    password,
    role,
    max_discount: maxDiscount,
    status: input.status ? requireEnum(input.status, Object.values(USER_STATUS), "status") : "active",
    branch_id: input.branch_id ?? null,
    terminal_id: input.terminal_id ?? null,
    commission_type: input.commission_type ?? null,
    commission_value: input.commission_value != null ? Number(input.commission_value) : null,
    daily_target: input.daily_target != null ? Number(input.daily_target) : null,
    monthly_target: input.monthly_target != null ? Number(input.monthly_target) : null,
  };
}

/**
 * Validate updating an existing user.
 *
 * @param {object} input
 * @returns {object} Validated update fields
 */
export function validateUpdateUser(input) {
  if (!input || typeof input !== "object") {
    throw new Error("Update payload must be an object");
  }

  const updates = {};

  if (input.full_name !== undefined || input.fullName !== undefined) {
    updates.full_name = requireString(input.full_name || input.fullName, "full_name");
  }
  if (input.username !== undefined) {
    updates.username = requireUsername(input.username, "username");
  }
  if (input.email !== undefined) {
    updates.email = optionalEmail(input.email, "email");
  }
  if (input.role !== undefined) {
    const validRoles = getAvailableRoles().map((r) => r.id);
    updates.role = requireEnum(input.role, validRoles, "role");
  }
  if (input.max_discount !== undefined || input.maxDiscount !== undefined) {
    updates.max_discount = requireNumberInRange(
      input.max_discount ?? input.maxDiscount,
      0,
      100,
      "max_discount"
    );
  }
  if (input.status !== undefined) {
    updates.status = requireEnum(input.status, Object.values(USER_STATUS), "status");
  }
  if (input.branch_id !== undefined) updates.branch_id = input.branch_id;
  if (input.terminal_id !== undefined) updates.terminal_id = input.terminal_id;
  if (input.commission_type !== undefined) updates.commission_type = input.commission_type;
  if (input.commission_value !== undefined) {
    updates.commission_value = input.commission_value != null ? Number(input.commission_value) : null;
  }
  if (input.daily_target !== undefined) {
    updates.daily_target = input.daily_target != null ? Number(input.daily_target) : null;
  }
  if (input.monthly_target !== undefined) {
    updates.monthly_target = input.monthly_target != null ? Number(input.monthly_target) : null;
  }

  return updates;
}

/**
 * Validate login parameters.
 *
 * @param {string} identifier
 * @param {string} password
 * @returns {{ identifier: string, password: string }}
 */
export function validateLoginPayload(identifier, password) {
  const cleanId = requireString(identifier, "identifier");
  const cleanPass = requirePassword(password, 1, "password");
  return { identifier: cleanId, password: cleanPass };
}
