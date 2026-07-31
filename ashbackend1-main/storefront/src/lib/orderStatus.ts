export const TRACKING_STEPS = [
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "prepared", label: "Prepared" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
] as const;

const STATUS_ALIASES: Record<string, string> = {
  pending: "pending",
  processing: "confirmed",
  confirmed: "confirmed",
  prepared: "prepared",
  shipped: "shipped",
  delivered: "delivered",
  done: "delivered",
  cancelled: "cancelled",
  canceled: "cancelled",
};

export function normalizeOrderStatus(status: string): string {
  return STATUS_ALIASES[status.trim().toLowerCase()] ?? status.trim().toLowerCase();
}

export function getTrackingStepIndex(status: string): number {
  const normalized = normalizeOrderStatus(status);
  if (normalized === "cancelled") return -1;
  const index = TRACKING_STEPS.findIndex((step) => step.key === normalized);
  return index >= 0 ? index : 0;
}

export function getStatusLabel(status: string): string {
  const normalized = normalizeOrderStatus(status);
  if (normalized === "cancelled") return "Cancelled";
  const step = TRACKING_STEPS.find((s) => s.key === normalized);
  return step?.label ?? status;
}
