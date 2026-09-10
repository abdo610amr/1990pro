/**
 * RBAC — Role-Based Access Control registry.
 *
 * This is the SINGLE SOURCE OF TRUTH for permissions and roles.
 *
 * Adding a new role (e.g. "manager", "warehouse", "branch_admin")
 * requires ONLY adding an entry to the ROLES object below.
 * No middleware, route, or service changes needed.
 *
 * Adding a new permission requires adding it to PERMISSIONS
 * and then assigning it to the appropriate roles.
 */

// ─────────────────────────────────────────────────────────────
// Permission constants
// ─────────────────────────────────────────────────────────────

export const PERMISSIONS = {
  // POS Operations
  POS_SELL:                "pos.sell",

  // Invoices / Orders
  INVOICE_CREATE:          "invoice.create",
  INVOICE_CANCEL:          "invoice.cancel",
  INVOICE_VOID:            "invoice.void",
  INVOICE_REPRINT:         "invoice.reprint",
  ORDERS_VIEW_SELF:        "orders.view.self",
  ORDERS_VIEW_ALL:         "orders.view.all",
  ORDERS_MANAGE:           "orders.manage",
  ORDERS_DELETE:           "orders.delete",

  // Refunds & Pricing
  REFUND_CREATE:           "refund.create",
  PRICE_OVERRIDE:          "price.override",
  DISCOUNT_APPLY:          "discount.apply",
  DISCOUNT_UNLIMITED:      "discount.unlimited",

  // Catalog
  PRODUCTS_VIEW:           "products.view",
  PRODUCTS_MANAGE:         "products.manage",
  INVENTORY_VIEW:          "inventory.view",
  INVENTORY_MANAGE:        "inventory.manage",
  CATEGORIES_MANAGE:       "categories.manage",
  BRANDS_MANAGE:           "brands.manage",

  // CRM
  CUSTOMERS_VIEW:          "customers.view",
  CUSTOMERS_MANAGE:        "customers.manage",

  // Users
  USERS_MANAGE:            "users.manage",

  // Reports & Analytics
  REPORTS_VIEW:            "reports.view",
  ANALYTICS_VIEW:          "analytics.view",
  KPI_VIEW:                "kpi.view",

  // System
  SETTINGS_MANAGE:         "settings.manage",
  AUDIT_VIEW:              "audit.view",

  // Marketing
  MARKETING_MANAGE:        "marketing.manage",

  // Shifts & Cash Drawer
  SHIFTS_MANAGE:           "shifts.manage",
  CASH_MOVEMENTS_MANAGE:   "cash_movements.manage",

  // Dashboard
  DASHBOARD_VIEW:          "dashboard.view",
};

// ─────────────────────────────────────────────────────────────
// Role definitions
// ─────────────────────────────────────────────────────────────

export const ROLES = {
  admin: {
    label: "Admin",
    description: "Full system access",
    permissions: Object.values(PERMISSIONS),
  },

  seller: {
    label: "Seller",
    description: "POS sales, own orders, basic catalog view",
    permissions: [
      PERMISSIONS.POS_SELL,
      PERMISSIONS.INVOICE_CREATE,
      PERMISSIONS.INVOICE_REPRINT,
      PERMISSIONS.ORDERS_VIEW_SELF,
      PERMISSIONS.DISCOUNT_APPLY,
      PERMISSIONS.PRODUCTS_VIEW,
      PERMISSIONS.INVENTORY_VIEW,
      PERMISSIONS.CUSTOMERS_VIEW,
      PERMISSIONS.SHIFTS_MANAGE,
      PERMISSIONS.CASH_MOVEMENTS_MANAGE,
      PERMISSIONS.DASHBOARD_VIEW,
    ],
  },

  // ─── Future roles (uncomment and assign permissions when ready) ───
  //
  // manager: {
  //   label: "Manager",
  //   description: "Store manager with extended access",
  //   permissions: [ ... ],
  // },
  //
  // warehouse: {
  //   label: "Warehouse",
  //   description: "Inventory and catalog management",
  //   permissions: [ ... ],
  // },
  //
  // branch_admin: {
  //   label: "Branch Admin",
  //   description: "Admin scoped to a single branch",
  //   permissions: [ ... ],
  // },
};

// ─────────────────────────────────────────────────────────────
// Utility functions
// ─────────────────────────────────────────────────────────────

/**
 * Check if a role has a specific permission.
 *
 * @param {string} role        Role key (e.g. "admin", "seller").
 * @param {string} permission  Permission string (e.g. "orders.view.all").
 * @returns {boolean}
 */
export function hasPermission(role, permission) {
  const roleDef = ROLES[role];
  if (!roleDef) return false;
  return roleDef.permissions.includes(permission);
}

/**
 * Check if a role has ANY of the given permissions.
 *
 * @param {string}   role
 * @param {string[]} permissions
 * @returns {boolean}
 */
export function hasAnyPermission(role, permissions) {
  return permissions.some((perm) => hasPermission(role, perm));
}

/**
 * Check if a role has ALL of the given permissions.
 *
 * @param {string}   role
 * @param {string[]} permissions
 * @returns {boolean}
 */
export function hasAllPermissions(role, permissions) {
  return permissions.every((perm) => hasPermission(role, perm));
}

/**
 * Get all permissions assigned to a role.
 *
 * @param {string} role
 * @returns {string[]}
 */
export function getPermissions(role) {
  return ROLES[role]?.permissions ?? [];
}

/**
 * Get metadata for all available roles.
 * Useful for populating role dropdowns in the admin UI.
 *
 * @returns {{ id: string, label: string, description: string, permissionCount: number }[]}
 */
export function getAvailableRoles() {
  return Object.entries(ROLES).map(([id, def]) => ({
    id,
    label: def.label,
    description: def.description,
    permissionCount: def.permissions.length,
  }));
}

/**
 * Get all registered permission strings.
 *
 * @returns {string[]}
 */
export function getAllPermissions() {
  return Object.values(PERMISSIONS);
}
