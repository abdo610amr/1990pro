/**
 * Shared constants across the application.
 */

export const SYSTEM_ROLES = {
  ADMIN: "admin",
  SELLER: "seller",
};

export const USER_STATUS = {
  ACTIVE: "active",
  DISABLED: "disabled",
};

export const ENTITY_TYPES = {
  USER: "user",
  ORDER: "order",
  PRODUCT: "product",
  CATEGORY: "category",
  BRAND: "brand",
  SHIFT: "shift",
  CASH_MOVEMENT: "cash_movement",
  INVENTORY_TRANSACTION: "inventory_transaction",
  SETTINGS: "settings",
};

export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 50,
  MAX_LIMIT: 200,
};
