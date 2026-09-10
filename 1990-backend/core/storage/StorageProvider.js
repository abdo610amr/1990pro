/**
 * StorageProvider — Abstract storage engine interface.
 *
 * A StorageProvider is responsible for:
 *   1. Initializing the underlying storage connection / files.
 *   2. Providing named repository instances.
 *   3. Cleaning up resources on shutdown.
 *
 * Concrete implementations:
 *   - JsonStorageProvider  (current — uses data/*.json via lib/jsonStore)
 *   - PostgresStorageProvider (future)
 *   - SqliteStorageProvider   (future — offline terminal)
 *
 * The DI container (container.js) creates ONE StorageProvider,
 * then extracts repositories from it and injects them into services.
 */
export class StorageProvider {
  /**
   * Initialize the storage engine.
   * For JSON: ensure data directory exists.
   * For Postgres: establish connection pool.
   *
   * @returns {Promise<void>}
   */
  async initialize() {
    throw new Error("StorageProvider.initialize() must be implemented");
  }

  /**
   * Gracefully shut down the storage engine.
   * For JSON: no-op.
   * For Postgres: drain connection pool.
   *
   * @returns {Promise<void>}
   */
  async close() {
    throw new Error("StorageProvider.close() must be implemented");
  }

  /**
   * Return a repository instance by name.
   *
   * Standard names:
   *   "users"                  → UserRepository
   *   "orders"                 → OrderRepository
   *   "products"               → ProductRepository
   *   "audit"                  → AuditRepository
   *   "shifts"                 → ShiftRepository
   *   "cashMovements"          → CashMovementRepository
   *   "inventoryTransactions"  → InventoryTransactionRepository
   *   "settings"               → SettingsRepository
   *
   * @param {string} name
   * @returns {import('./BaseRepository.js').BaseRepository}
   */
  getRepository(name) {
    throw new Error(`StorageProvider.getRepository("${name}") must be implemented`);
  }
}
