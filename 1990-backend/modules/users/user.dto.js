/**
 * User DTOs — Data Transfer Objects for User entity.
 * Strips sensitive data (passwordHash, active_sessions tokens) for API responses.
 */

/**
 * Convert user entity to a clean public DTO (for storefront/customer view).
 *
 * @param {object} user
 * @returns {object|null}
 */
export function toPublicUserDTO(user) {
  if (!user) return null;
  return {
    id: user.id,
    uuid: user.uuid,
    full_name: user.full_name || `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    username: user.username || null,
    email: user.email || "",
    role: user.role || "customer",
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    phone: user.phone || "",
    avatar: user.avatar || null,
    created_at: user.created_at || user.createdAt || null,
  };
}

/**
 * Convert user entity to a comprehensive staff DTO (for admin management).
 *
 * @param {object} user
 * @returns {object|null}
 */
export function toStaffUserDTO(user) {
  if (!user) return null;
  return {
    id: user.id,
    uuid: user.uuid,
    full_name: user.full_name || `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    username: user.username || "",
    email: user.email || "",
    role: user.role || "seller",
    max_discount: user.max_discount ?? 0,
    status: user.status || "active",
    branch_id: user.branch_id ?? null,
    terminal_id: user.terminal_id ?? null,
    commission_type: user.commission_type ?? null,
    commission_value: user.commission_value ?? null,
    daily_target: user.daily_target ?? null,
    monthly_target: user.monthly_target ?? null,
    last_login: user.last_login ?? null,
    last_activity: user.last_activity ?? null,
    created_at: user.created_at || user.createdAt || null,
    updated_at: user.updated_at || user.updatedAt || null,
    deleted_at: user.deleted_at ?? null,
  };
}

/**
 * Convert array of staff users to DTO list.
 *
 * @param {object[]} users
 * @returns {object[]}
 */
export function toStaffUserListDTO(users) {
  if (!Array.isArray(users)) return [];
  return users.map(toStaffUserDTO);
}
