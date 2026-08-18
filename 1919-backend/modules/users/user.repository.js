/**
 * UserRepository — Repository interface for User entities.
 *
 * Extends BaseRepository to enforce consistent user data access.
 * Implementations (JsonUserRepository, PostgresUserRepository) must implement all methods.
 */

import { BaseRepository } from "../../core/BaseRepository.js";

export class UserRepository extends BaseRepository {
  /**
   * Find a user by exact username match (case-insensitive).
   *
   * @param {string} username
   * @returns {Promise<object|null>}
   */
  async findByUsername(username) {
    throw new Error("UserRepository.findByUsername() must be implemented");
  }

  /**
   * Find a user by exact email match (case-insensitive).
   *
   * @param {string} email
   * @returns {Promise<object|null>}
   */
  async findByEmail(email) {
    throw new Error("UserRepository.findByEmail() must be implemented");
  }

  /**
   * Find a user by either username OR email identifier.
   *
   * @param {string} identifier  Username or email
   * @returns {Promise<object|null>}
   */
  async findByLogin(identifier) {
    throw new Error("UserRepository.findByLogin() must be implemented");
  }

  /**
   * Find all staff users (role != 'customer', excludes soft-deleted by default).
   *
   * @param {object} [filter={}]
   * @returns {Promise<object[]>}
   */
  async findAllStaff(filter = {}) {
    throw new Error("UserRepository.findAllStaff() must be implemented");
  }
}
