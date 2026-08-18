/**
 * AuditService — Business logic service for Audit Logging.
 *
 * Isolated service responsible for recording and querying system audit logs.
 * Depends ONLY on the AuditRepository abstraction passed via constructor.
 */

import { AppError, ValidationError } from "../../shared/errors/AppError.js";
import { toAuditResponseDTO, toAuditListResponseDTO } from "./audit.dto.js";

export class AuditService {
  /**
   * @param {import('./audit.repository.js').AuditRepository} auditRepository
   */
  constructor(auditRepository) {
    if (!auditRepository) {
      throw new AppError("AuditService requires an AuditRepository instance", 500, "DEPENDENCY_ERROR");
    }
    this.repo = auditRepository;
  }

  /**
   * Record a new audit log entry.
   *
   * @param {object} params
   * @param {number|string|null} [params.actorId]
   * @param {number|string|null} [params.actor_id]
   * @param {string} [params.actorType="user"]
   * @param {string} [params.actor_type]
   * @param {string} params.action  Required action descriptor (e.g. "order.created")
   * @param {string|null} [params.entityType]
   * @param {string|null} [params.entity_type]
   * @param {number|string|null} [params.entityId]
   * @param {number|string|null} [params.entity_id]
   * @param {object} [params.metadata={}]
   * @param {string|null} [params.ipAddress]
   * @param {string|null} [params.ip_address]
   * @param {string|null} [params.userAgent]
   * @param {string|null} [params.user_agent]
   * @returns {Promise<object>} The created audit entry DTO.
   */
  async log(params) {
    if (!params || typeof params !== "object") {
      throw new ValidationError("Audit log parameters must be an object");
    }

    const action = params.action;
    if (!action || typeof action !== "string" || action.trim().length === 0) {
      throw new ValidationError("Audit log action is required and must be a non-empty string");
    }

    const entryData = {
      actor_id: params.actorId ?? params.actor_id ?? null,
      actor_type: params.actorType ?? params.actor_type ?? "user",
      action: action.trim(),
      entity_type: params.entityType ?? params.entity_type ?? null,
      entity_id: params.entityId ?? params.entity_id ?? null,
      metadata: params.metadata && typeof params.metadata === "object" ? params.metadata : {},
      ip_address: params.ipAddress ?? params.ip_address ?? null,
      user_agent: params.userAgent ?? params.user_agent ?? null,
    };

    const created = await this.repo.create(entryData);
    return toAuditResponseDTO(created);
  }

  /**
   * Query audit log entries with optional filters.
   *
   * @param {object} [filter={}]
   * @returns {Promise<object[]>}
   */
  async getLogs(filter = {}) {
    const entries = await this.repo.findAll(filter);
    return toAuditListResponseDTO(entries);
  }

  /**
   * Find a single audit entry by ID.
   *
   * @param {number} id
   * @returns {Promise<object|null>}
   */
  async getById(id) {
    const entry = await this.repo.findById(id);
    return toAuditResponseDTO(entry);
  }

  /**
   * Find a single audit entry by UUID.
   *
   * @param {string} uuid
   * @returns {Promise<object|null>}
   */
  async getByUuid(uuid) {
    const entry = await this.repo.findByUuid(uuid);
    return toAuditResponseDTO(entry);
  }

  /**
   * Find entries by actor.
   *
   * @param {number|string} actorId
   * @param {string} [actorType=null]
   * @returns {Promise<object[]>}
   */
  async getByActor(actorId, actorType = null) {
    const entries = await this.repo.findByActor(actorId, actorType);
    return toAuditListResponseDTO(entries);
  }

  /**
   * Find entries by target entity.
   *
   * @param {string} entityType
   * @param {number|string} entityId
   * @returns {Promise<object[]>}
   */
  async getByEntity(entityType, entityId) {
    const entries = await this.repo.findByEntity(entityType, entityId);
    return toAuditListResponseDTO(entries);
  }

  /**
   * Find entries by action.
   *
   * @param {string} action
   * @returns {Promise<object[]>}
   */
  async getByAction(action) {
    const entries = await this.repo.findByAction(action);
    return toAuditListResponseDTO(entries);
  }

  /**
   * Find entries by date range.
   *
   * @param {string|Date} startDate
   * @param {string|Date} endDate
   * @returns {Promise<object[]>}
   */
  async getByDateRange(startDate, endDate) {
    const entries = await this.repo.findByDateRange(startDate, endDate);
    return toAuditListResponseDTO(entries);
  }

  /**
   * Count matching audit entries.
   *
   * @param {object} [filter={}]
   * @returns {Promise<number>}
   */
  async countLogs(filter = {}) {
    return this.repo.count(filter);
  }
}
