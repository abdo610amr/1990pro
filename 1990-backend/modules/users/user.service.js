/**
 * UserService — Business logic service for User management & authentication.
 *
 * Handles staff creation, updates, soft deletion, password hashing, account lockout,
 * and emits domain events via EventBus.
 * Depends ONLY on UserRepository interface and EventBus.
 */

import bcrypt from "bcryptjs";
import {
  AppError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  ConflictError,
  AccountLockedError,
  BusinessRuleError,
} from "../../shared/errors/AppError.js";
import { now, parseDate } from "../../shared/utils/timestamps.js";
import { USER_EVENTS } from "./user.events.js";
import { toStaffUserDTO, toStaffUserListDTO } from "./user.dto.js";
import {
  validateCreateStaffUser,
  validateUpdateUser,
  validateLoginPayload,
} from "./user.validators.js";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export class UserService {
  /**
   * @param {import('./user.repository.js').UserRepository} userRepository
   * @param {import('../../core/EventBus.js').EventBus} [eventBus=null]
   */
  constructor(userRepository, eventBus = null) {
    if (!userRepository) {
      throw new AppError("UserService requires a UserRepository instance", 500, "DEPENDENCY_ERROR");
    }
    this.repo = userRepository;
    this.eventBus = eventBus;
  }

  /**
   * Safely emit domain events if EventBus is present.
   * @private
   */
  _emit(event, payload) {
    if (this.eventBus && typeof this.eventBus.emit === "function") {
      this.eventBus.emit(event, payload);
    }
  }

  /**
   * Authenticate a user by username or email.
   * Handles account lockout and failed attempt tracking.
   *
   * @param {string} identifier  Username or email
   * @param {string} password
   * @returns {Promise<object>} Authenticated staff/public user DTO
   */
  async authenticate(identifier, password) {
    const clean = validateLoginPayload(identifier, password);
    const user = await this.repo.findByLogin(clean.identifier);

    if (!user) {
      this._emit(USER_EVENTS.LOGIN_FAILED, { identifier: clean.identifier, reason: "NOT_FOUND" });
      throw new AuthenticationError("Invalid username or password");
    }

    // Check account lock
    if (user.locked_until) {
      const lockEnd = parseDate(user.locked_until);
      if (lockEnd && lockEnd > new Date()) {
        this._emit(USER_EVENTS.LOGIN_FAILED, { userId: user.id, reason: "LOCKED" });
        throw new AccountLockedError(user.locked_until);
      }
    }

    // Check user status
    if (user.status !== "active") {
      this._emit(USER_EVENTS.LOGIN_FAILED, { userId: user.id, reason: "DISABLED" });
      throw new AuthenticationError("Account is disabled. Please contact an administrator.");
    }

    // Verify password
    const isMatch = await bcrypt.compare(clean.password, user.passwordHash || "");

    if (!isMatch) {
      const attempts = (user.failed_login_attempts || 0) + 1;
      const updatePayload = { failed_login_attempts: attempts };

      if (attempts >= MAX_FAILED_ATTEMPTS) {
        const lockUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000).toISOString();
        updatePayload.locked_until = lockUntil;
        this._emit(USER_EVENTS.ACCOUNT_LOCKED, { userId: user.id, lockedUntil: lockUntil });
      }

      await this.repo.update(user.id, updatePayload);
      this._emit(USER_EVENTS.LOGIN_FAILED, { userId: user.id, reason: "INVALID_PASSWORD" });
      throw new AuthenticationError("Invalid username or password");
    }

    // Reset failed attempts & record last_login
    const currentNow = now();
    await this.repo.update(user.id, {
      failed_login_attempts: 0,
      locked_until: null,
      last_login: currentNow,
      last_activity: currentNow,
    });

    this._emit(USER_EVENTS.LOGIN_SUCCESS, { userId: user.id, role: user.role });
    return toStaffUserDTO(user);
  }

  /**
   * Create a new staff user account.
   *
   * @param {object} input
   * @param {number|string|null} [actorId=null]
   * @returns {Promise<object>} Created staff DTO
   */
  async createStaffUser(input, actorId = null) {
    const validated = validateCreateStaffUser(input);

    // Check username uniqueness
    const existingUser = await this.repo.findByUsername(validated.username, true);
    if (existingUser) {
      throw new ConflictError(`Username "${validated.username}" is already taken`);
    }

    // Check email uniqueness if email provided
    if (validated.email) {
      const existingEmail = await this.repo.findByEmail(validated.email, true);
      if (existingEmail) {
        throw new ConflictError(`Email "${validated.email}" is already registered`);
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validated.password, 10);

    const created = await this.repo.create({
      ...validated,
      passwordHash,
    });

    this._emit(USER_EVENTS.CREATED, { user: created, actorId });
    return toStaffUserDTO(created);
  }

  /**
   * Update an existing user.
   *
   * @param {number} id
   * @param {object} input
   * @param {number|string|null} [actorId=null]
   * @returns {Promise<object>} Updated staff DTO
   */
  async updateUser(id, input, actorId = null) {
    const user = await this.repo.findById(id);
    if (!user) {
      throw new NotFoundError("User", id);
    }

    const validated = validateUpdateUser(input);

    // Prevent user from modifying their own role
    if (actorId && Number(actorId) === Number(id) && validated.role && validated.role !== user.role) {
      throw new BusinessRuleError("You cannot modify your own role");
    }

    // Check username uniqueness if changed
    if (validated.username && validated.username.toLowerCase() !== (user.username || "").toLowerCase()) {
      const existing = await this.repo.findByUsername(validated.username, true);
      if (existing && existing.id !== user.id) {
        throw new ConflictError(`Username "${validated.username}" is already taken`);
      }
    }

    // Check email uniqueness if changed
    if (validated.email && validated.email.toLowerCase() !== (user.email || "").toLowerCase()) {
      const existing = await this.repo.findByEmail(validated.email, true);
      if (existing && existing.id !== user.id) {
        throw new ConflictError(`Email "${validated.email}" is already registered`);
      }
    }

    const updated = await this.repo.update(id, validated);
    this._emit(USER_EVENTS.UPDATED, { user: updated, actorId });
    return toStaffUserDTO(updated);
  }

  /**
   * Soft-delete a user.
   *
   * @param {number} id
   * @param {number|string|null} [actorId=null]
   * @returns {Promise<boolean>}
   */
  async softDeleteUser(id, actorId = null) {
    const user = await this.repo.findById(id);
    if (!user) {
      throw new NotFoundError("User", id);
    }

    if (actorId && Number(actorId) === Number(id)) {
      throw new BusinessRuleError("You cannot delete your own user account");
    }

    const success = await this.repo.softDelete(id);
    if (success) {
      this._emit(USER_EVENTS.DELETED, { userId: id, actorId });
    }
    return success;
  }

  /**
   * Toggle user active/disabled status.
   *
   * @param {number} id
   * @param {string} status  "active" | "disabled"
   * @param {number|string|null} [actorId=null]
   * @returns {Promise<object>}
   */
  async toggleStatus(id, status, actorId = null) {
    if (!["active", "disabled"].includes(status)) {
      throw new ValidationError('Status must be "active" or "disabled"');
    }

    const user = await this.repo.findById(id);
    if (!user) {
      throw new NotFoundError("User", id);
    }

    if (actorId && Number(actorId) === Number(id) && status === "disabled") {
      throw new BusinessRuleError("You cannot disable your own user account");
    }

    const updated = await this.repo.update(id, { status });
    this._emit(USER_EVENTS.STATUS_CHANGED, { userId: id, status, actorId });
    return toStaffUserDTO(updated);
  }

  /**
   * Reset user password.
   *
   * @param {number} id
   * @param {string} newPassword
   * @param {number|string|null} [actorId=null]
   * @returns {Promise<boolean>}
   */
  async resetPassword(id, newPassword, actorId = null) {
    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      throw new ValidationError("Password must be at least 6 characters long");
    }

    const user = await this.repo.findById(id);
    if (!user) {
      throw new NotFoundError("User", id);
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.repo.update(id, {
      passwordHash,
      failed_login_attempts: 0,
      locked_until: null,
    });

    this._emit(USER_EVENTS.PASSWORD_RESET, { userId: id, actorId });
    return true;
  }

  /**
   * Get single user by ID.
   *
   * @param {number} id
   * @returns {Promise<object|null>}
   */
  async getUserById(id) {
    const user = await this.repo.findById(id);
    return toStaffUserDTO(user);
  }

  /**
   * List staff users.
   *
   * @param {object} [filter={}]
   * @returns {Promise<object[]>}
   */
  async listStaff(filter = {}) {
    const users = await this.repo.findAllStaff(filter);
    return toStaffUserListDTO(users);
  }
}
