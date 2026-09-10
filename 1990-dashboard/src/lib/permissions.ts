/**
 * Role-Based Access Control (RBAC) definition for POS.
 * Two roles only: Admin and Seller.
 */

export type PosRole = "admin" | "seller";

export type Permission =
  | "dashboard.view"
  | "pos.sell"
  | "orders.manage"
  | "returns.manage"
  | "catalog.manage"
  | "inventory.manage"
  | "inventory.view"
  | "customers.view"
  | "users.manage"
  | "seller_performance.view"
  | "marketing.manage"
  | "reviews.manage"
  | "reports.view"
  | "notifications.manage"
  | "settings.manage"
  | "media.view"
  | "shifts.manage"
  | "audit.view";

export const ROLE_PERMISSIONS: Record<PosRole, Permission[]> = {
  admin: [
    "dashboard.view",
    "pos.sell",
    "orders.manage",
    "returns.manage",
    "catalog.manage",
    "inventory.manage",
    "inventory.view",
    "customers.view",
    "users.manage",
    "seller_performance.view",
    "marketing.manage",
    "reviews.manage",
    "reports.view",
    "notifications.manage",
    "settings.manage",
    "media.view",
    "shifts.manage",
    "audit.view",
  ],
  seller: [
    "pos.sell",
    "orders.manage",
    "inventory.view",
    "customers.view",
    "shifts.manage",
  ],
};

export function canAccess(
  role: PosRole | string | null | undefined,
  permission: Permission
): boolean {
  if (!role) return false;
  const normalized = (role.toLowerCase() === "admin" ? "admin" : "seller") as PosRole;
  const permissions = ROLE_PERMISSIONS[normalized] ?? [];
  return permissions.includes(permission);
}

export function filterNavByRole<T extends { permission?: Permission }>(
  items: T[],
  role: PosRole | string | null | undefined
): T[] {
  return items.filter((item) => !item.permission || canAccess(role, item.permission));
}
