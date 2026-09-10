import type { PosRole } from "@/lib/permissions";

export const SITE_NAME = "1990";
export const SITE_SLOGAN = "Made For Originals";
export const SITE_MARK = "OTZ";
export const SITE_ESTABLISHED = "2026";

export const POS_ROLES: { id: PosRole; label: string }[] = [
  { id: "admin", label: "Admin" },
  { id: "seller", label: "Seller" },
];

export type { PosRole };

export const PAYMENT_METHODS = [
  { id: "cash", label: "Cash", supported: true },
  { id: "card", label: "Card", supported: true },
  { id: "instapay", label: "InstaPay", supported: true },
  { id: "split", label: "Split Payment", supported: "local" as const },
  { id: "store_credit", label: "Store Credit", supported: false },
  { id: "gift_card", label: "Gift Card", supported: false },
] as const;

export const SHORTCUTS = [
  { key: "F2", action: "Focus search" },
  { key: "F4", action: "Pay" },
  { key: "F8", action: "Suspend order" },
  { key: "F9", action: "Clear cart" },
  { key: "Esc", action: "Close dialog" },
] as const;
