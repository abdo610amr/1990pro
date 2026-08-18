/**
 * AuditRepository — Repository interface for Audit Log entries.
 *
 * Extends BaseRepository to enforce consistent data access methods.
 * Storage engines (JSON, Postgres, SQLite) implement this interface.
 */

import { BaseRepository } from "../../core/BaseRepository.js";

export class AuditRepository extends BaseRepository {
  /**
   * Find audit entries created by a specific actor.
   *
   * @param {number|string} actorId
   * @param {string} [actorType]  e.g. "user", "system"
   * @returns {Promise<object[]>}
   */
  async findByActor(actorId, actorType = null) {
    throw new Error("AuditRepository.findByActor() must be implemented");
  }

  /**
   * Find audit entries associated with a specific target entity.
   *
   * @param {string} entityType  e.g. "order", "user", "product"
   * @param {number|string} entityId
   * @returns {Promise<object[]>}
   */
  async findByEntity(entityType, entityId) {
    throw new Error("AuditRepository.findByEntity() must be implemented");
  }

  /**
   * Find audit entries by action name.
   *
   * @param {string} action  e.g. "login.success", "order.created"
   * @returns {Promise<object[]>}
   */
  async findByAction(action) {
    throw new Error("AuditRepository.findByAction() must be implemented");
  }

  /**
   * Find audit entries created within a date range (inclusive).
   *
   * @param {string|Date} startDate  ISO string or Date
   * @param {string|Date} endDate    ISO string or Date
   * @returns {Promise<object[]>}
   */
  async findByDateRange(startDate, endDate) {
    throw new Error("AuditRepository.findByDateRange() must be implemented");
  }
}
