/**
 * JsonUserRepository — JSON file storage implementation of UserRepository.
 *
 * Persists user records to data/users.json using StorageProvider.
 * Auto-filters soft-deleted records (deleted_at !== null) by default.
 */

import { UserRepository } from "../user.repository.js";
import { generateUuid } from "../../../shared/utils/uuid.js";
import { createdTimestamps, updatedTimestamp, deletedTimestamp, isDeleted } from "../../../shared/utils/timestamps.js";

export class JsonUserRepository extends UserRepository {
  /**
   * @param {import('../../../core/storage/StorageProvider.js').StorageProvider} storageProvider
   */
  constructor(storageProvider) {
    super();
    this.storage = storageProvider.getRepository("users");
  }

  /**
   * Read raw users collection.
   * @private
   */
  async _readAll() {
    return (await this.storage.readAll()) || [];
  }

  /**
   * Write users collection.
   * @private
   */
  async _writeAll(data) {
    await this.storage.writeAll(data);
  }

  async findById(id, includeDeleted = false) {
    const users = await this._readAll();
    const numId = Number(id);
    const user = users.find((u) => Number(u.id) === numId) || null;
    if (user && !includeDeleted && isDeleted(user)) return null;
    return user;
  }

  async findByUuid(uuid, includeDeleted = false) {
    const users = await this._readAll();
    const user = users.find((u) => u.uuid === uuid) || null;
    if (user && !includeDeleted && isDeleted(user)) return null;
    return user;
  }

  async findByUsername(username, includeDeleted = false) {
    if (!username) return null;
    const users = await this._readAll();
    const lower = username.toLowerCase();
    const user = users.find((u) => u.username && u.username.toLowerCase() === lower) || null;
    if (user && !includeDeleted && isDeleted(user)) return null;
    return user;
  }

  async findByEmail(email, includeDeleted = false) {
    if (!email) return null;
    const users = await this._readAll();
    const lower = email.toLowerCase();
    const user = users.find((u) => u.email && u.email.toLowerCase() === lower) || null;
    if (user && !includeDeleted && isDeleted(user)) return null;
    return user;
  }

  async findByLogin(identifier, includeDeleted = false) {
    if (!identifier) return null;
    const users = await this._readAll();
    const lower = identifier.toLowerCase();
    const user =
      users.find(
        (u) =>
          (u.username && u.username.toLowerCase() === lower) ||
          (u.email && u.email.toLowerCase() === lower)
      ) || null;

    if (user && !includeDeleted && isDeleted(user)) return null;
    return user;
  }

  async findAll(filter = {}) {
    let users = await this._readAll();

    // Auto-filter soft-deleted
    if (!filter.includeDeleted) {
      users = users.filter((u) => !isDeleted(u));
    }

    if (filter.role) {
      users = users.filter((u) => u.role === filter.role);
    }
    if (filter.status) {
      users = users.filter((u) => u.status === filter.status);
    }
    if (filter.branchId !== undefined) {
      users = users.filter((u) => u.branch_id === filter.branchId);
    }

    // Pagination
    if (filter.limit !== undefined) {
      const limit = Math.max(1, Number(filter.limit) || 50);
      const page = Math.max(1, Number(filter.page) || 1);
      const offset = filter.offset !== undefined ? Math.max(0, Number(filter.offset)) : (page - 1) * limit;
      users = users.slice(offset, offset + limit);
    }

    return users;
  }

  async findAllStaff(filter = {}) {
    let users = await this._readAll();

    if (!filter.includeDeleted) {
      users = users.filter((u) => !isDeleted(u));
    }

    // Exclude customer accounts
    users = users.filter((u) => u.role && u.role !== "customer");

    if (filter.role) {
      users = users.filter((u) => u.role === filter.role);
    }
    if (filter.status) {
      users = users.filter((u) => u.status === filter.status);
    }

    return users;
  }

  async create(data) {
    const users = await this._readAll();
    const id = this.storage.getNextId(users);
    const timestamps = createdTimestamps();

    const newUser = {
      id,
      uuid: generateUuid(),
      full_name: data.full_name || `${data.firstName || ""} ${data.lastName || ""}`.trim(),
      username: data.username || `user_${id}`,
      email: data.email || "",
      passwordHash: data.passwordHash || "",
      role: data.role || "seller",
      max_discount: data.max_discount ?? (data.role === "admin" ? 100 : 0),
      status: data.status || "active",
      failed_login_attempts: 0,
      locked_until: null,
      last_login: null,
      last_activity: null,
      active_sessions: [],
      branch_id: data.branch_id ?? null,
      terminal_id: data.terminal_id ?? null,
      commission_type: data.commission_type ?? null,
      commission_value: data.commission_value ?? null,
      daily_target: data.daily_target ?? null,
      monthly_target: data.monthly_target ?? null,
      firstName: data.firstName || data.full_name?.split(" ")[0] || "",
      lastName: data.lastName || data.full_name?.split(" ").slice(1).join(" ") || "",
      phone: data.phone || "",
      avatar: data.avatar || null,
      addresses: data.addresses || [],
      wishlist: data.wishlist || [],
      ...timestamps,
    };

    users.push(newUser);
    await this._writeAll(users);
    return newUser;
  }

  async update(id, data) {
    const users = await this._readAll();
    const numId = Number(id);
    const index = users.findIndex((u) => Number(u.id) === numId);

    if (index === -1) return null;

    const current = users[index];
    const updated = {
      ...current,
      ...data,
      ...updatedTimestamp(),
    };

    users[index] = updated;
    await this._writeAll(users);
    return updated;
  }

  async softDelete(id) {
    const users = await this._readAll();
    const numId = Number(id);
    const index = users.findIndex((u) => Number(u.id) === numId);

    if (index === -1) return false;

    users[index] = {
      ...users[index],
      ...deletedTimestamp(),
    };

    await this._writeAll(users);
    return true;
  }

  async hardDelete(id) {
    const users = await this._readAll();
    const numId = Number(id);
    const filtered = users.filter((u) => Number(u.id) !== numId);

    if (filtered.length === users.length) return false;

    await this._writeAll(filtered);
    return true;
  }

  async count(filter = {}) {
    const items = await this.findAll(filter);
    return items.length;
  }
}
