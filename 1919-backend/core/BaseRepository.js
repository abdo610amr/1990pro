/**
 * BaseRepository — Abstract repository contract.
 *
 * Every repository implementation (Json, Postgres, SQLite, etc.)
 * must extend this class and implement all methods.
 *
 * Services depend ONLY on this contract, never on a specific
 * storage engine. Swapping storage = swapping the concrete class.
 *
 * All methods are async to support both sync (JSON) and async (DB) engines.
 */
export class BaseRepository {
  /**
   * Find a single record by its integer ID.
   * @param {number} id
   * @returns {Promise<object|null>}
   */
  async findById(id) {
    throw new Error("BaseRepository.findById() must be implemented");
  }

  /**
   * Find a single record by its UUID.
   * @param {string} uuid
   * @returns {Promise<object|null>}
   */
  async findByUuid(uuid) {
    throw new Error("BaseRepository.findByUuid() must be implemented");
  }

  /**
   * Return all records matching an optional filter.
   * Soft-deleted records (deleted_at !== null) should be excluded
   * by default unless filter.includeDeleted is true.
   *
   * @param {object} [filter={}]
   * @param {boolean} [filter.includeDeleted=false]
   * @returns {Promise<object[]>}
   */
  async findAll(filter = {}) {
    throw new Error("BaseRepository.findAll() must be implemented");
  }

  /**
   * Create a new record.  The implementation must assign:
   *   id          — auto-increment integer
   *   uuid        — v4 UUID
   *   created_at  — ISO 8601 timestamp
   *   updated_at  — ISO 8601 timestamp
   *
   * @param {object} data
   * @returns {Promise<object>} The created record.
   */
  async create(data) {
    throw new Error("BaseRepository.create() must be implemented");
  }

  /**
   * Update an existing record by ID.
   * Must set updated_at to the current timestamp.
   *
   * @param {number} id
   * @param {object} data  Partial fields to merge.
   * @returns {Promise<object|null>} The updated record, or null if not found.
   */
  async update(id, data) {
    throw new Error("BaseRepository.update() must be implemented");
  }

  /**
   * Soft-delete a record by setting deleted_at.
   *
   * @param {number} id
   * @returns {Promise<boolean>} true if the record existed and was soft-deleted.
   */
  async softDelete(id) {
    throw new Error("BaseRepository.softDelete() must be implemented");
  }

  /**
   * Permanently remove a record.
   * Use sparingly — prefer softDelete for auditable entities.
   *
   * @param {number} id
   * @returns {Promise<boolean>} true if the record existed and was removed.
   */
  async hardDelete(id) {
    throw new Error("BaseRepository.hardDelete() must be implemented");
  }

  /**
   * Count records matching an optional filter.
   *
   * @param {object} [filter={}]
   * @returns {Promise<number>}
   */
  async count(filter = {}) {
    throw new Error("BaseRepository.count() must be implemented");
  }

  /**
   * Check whether a record with the given ID exists (and is not soft-deleted).
   *
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  async exists(id) {
    const record = await this.findById(id);
    return record !== null;
  }
}
