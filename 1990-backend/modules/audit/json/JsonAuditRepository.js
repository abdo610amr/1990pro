/**
 * JsonAuditRepository — JSON file storage implementation of AuditRepository.
 *
 * Persists audit logs to data/audit-log.json using StorageProvider accessor.
 */

import { AuditRepository } from "../audit.repository.js";
import { generateUuid } from "../../../shared/utils/uuid.js";
import { createdTimestamps, parseDate } from "../../../shared/utils/timestamps.js";
import { BusinessRuleError } from "../../../shared/errors/AppError.js";

export class JsonAuditRepository extends AuditRepository {
  /**
   * @param {import('../../../core/storage/StorageProvider.js').StorageProvider} storageProvider
   */
  constructor(storageProvider) {
    super();
    this.storage = storageProvider.getRepository("auditLog");
  }

  /**
   * Read all entries from file storage.
   * @private
   */
  async _readAll() {
    return (await this.storage.readAll()) || [];
  }

  /**
   * Write all entries to file storage.
   * @private
   */
  async _writeAll(data) {
    await this.storage.writeAll(data);
  }

  async findById(id) {
    const entries = await this._readAll();
    const numId = Number(id);
    return entries.find((e) => Number(e.id) === numId) || null;
  }

  async findByUuid(uuid) {
    const entries = await this._readAll();
    return entries.find((e) => e.uuid === uuid) || null;
  }

  async findAll(filter = {}) {
    let entries = await this._readAll();

    if (filter.actorId !== undefined) {
      entries = entries.filter((e) => String(e.actor_id) === String(filter.actorId));
    }
    if (filter.actorType) {
      entries = entries.filter((e) => e.actor_type === filter.actorType);
    }
    if (filter.action) {
      entries = entries.filter((e) => e.action === filter.action);
    }
    if (filter.entityType) {
      entries = entries.filter((e) => e.entity_type === filter.entityType);
    }
    if (filter.entityId !== undefined) {
      entries = entries.filter((e) => String(e.entity_id) === String(filter.entityId));
    }
    if (filter.startDate) {
      const start = parseDate(filter.startDate);
      if (start) {
        entries = entries.filter((e) => {
          const d = parseDate(e.created_at);
          return d && d >= start;
        });
      }
    }
    if (filter.endDate) {
      const end = parseDate(filter.endDate);
      if (end) {
        entries = entries.filter((e) => {
          const d = parseDate(e.created_at);
          return d && d <= end;
        });
      }
    }

    // Default sorting: newest first
    entries.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Optional Pagination
    if (filter.limit !== undefined) {
      const limit = Math.max(1, Number(filter.limit) || 50);
      const page = Math.max(1, Number(filter.page) || 1);
      const offset = filter.offset !== undefined ? Math.max(0, Number(filter.offset)) : (page - 1) * limit;
      entries = entries.slice(offset, offset + limit);
    }

    return entries;
  }

  async create(data) {
    const entries = await this._readAll();
    const id = this.storage.getNextId(entries);
    const timestamps = createdTimestamps();

    const newEntry = {
      id,
      uuid: generateUuid(),
      actor_id: data.actor_id ?? data.actorId ?? null,
      actor_type: data.actor_type ?? data.actorType ?? "user",
      action: data.action || "unknown",
      entity_type: data.entity_type ?? data.entityType ?? null,
      entity_id: data.entity_id ?? data.entityId ?? null,
      metadata: data.metadata || {},
      ip_address: data.ip_address ?? data.ipAddress ?? null,
      user_agent: data.user_agent ?? data.userAgent ?? null,
      ...timestamps,
    };

    entries.push(newEntry);
    await this._writeAll(entries);
    return newEntry;
  }

  async update(id, data) {
    // Audit logs are append-only. Updates are disallowed.
    throw new BusinessRuleError("Audit entries cannot be updated once created");
  }

  async softDelete(id) {
    // Audit logs are immutable. Soft-delete is disallowed.
    throw new BusinessRuleError("Audit entries cannot be deleted");
  }

  async hardDelete(id) {
    // Audit logs are immutable. Hard-delete is disallowed.
    throw new BusinessRuleError("Audit entries cannot be deleted");
  }

  async count(filter = {}) {
    const matched = await this.findAll(filter);
    return matched.length;
  }

  async findByActor(actorId, actorType = null) {
    return this.findAll({ actorId, ...(actorType ? { actorType } : {}) });
  }

  async findByEntity(entityType, entityId) {
    return this.findAll({ entityType, entityId });
  }

  async findByAction(action) {
    return this.findAll({ action });
  }

  async findByDateRange(startDate, endDate) {
    return this.findAll({ startDate, endDate });
  }
}
