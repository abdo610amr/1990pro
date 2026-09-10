/**
 * DTOs for Audit module.
 * Converts raw database entries to clean API response objects
 * and validates creation payloads.
 */

/**
 * Serialize an audit log entry for API output.
 *
 * @param {object} entry
 * @returns {object}
 */
export function toAuditResponseDTO(entry) {
  if (!entry) return null;
  return {
    id: entry.id,
    uuid: entry.uuid,
    actor_id: entry.actor_id,
    actor_type: entry.actor_type,
    action: entry.action,
    entity_type: entry.entity_type,
    entity_id: entry.entity_id,
    metadata: entry.metadata || {},
    ip_address: entry.ip_address,
    user_agent: entry.user_agent,
    created_at: entry.created_at,
  };
}

/**
 * Serialize a list of audit log entries.
 *
 * @param {object[]} entries
 * @returns {object[]}
 */
export function toAuditListResponseDTO(entries) {
  if (!Array.isArray(entries)) return [];
  return entries.map(toAuditResponseDTO);
}
