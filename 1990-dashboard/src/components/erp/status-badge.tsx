"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ORDER_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  preparing: "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200",
  ready: "bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-200",
  completed: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  cancelled: "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200",
  returned: "bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200",
  // Legacy aliases (shown if raw data appears before migration)
  confirmed: "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200",
  prepared: "bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-200",
  shipped: "bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-200",
  delivered: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
};

const STOCK_COLORS: Record<string, string> = {
  in_stock: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  low_stock: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  sold_out: "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200",
  available: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  active: "bg-emerald-100 text-emerald-900",
  draft: "bg-slate-100 text-slate-700",
  archived: "bg-zinc-200 text-zinc-700",
};

export function StatusBadge({
  value,
  kind = "order",
}: {
  value: string;
  kind?: "order" | "stock" | "generic" | "brand" | "user";
}) {
  const key = String(value || "").toLowerCase();
  const palette =
    kind === "order" ? ORDER_COLORS : kind === "stock" ? STOCK_COLORS : STOCK_COLORS;
  return (
    <Badge
      className={cn(
        "normal-case tracking-normal",
        palette[key] || "bg-secondary text-secondary-foreground"
      )}
    >
      {value || "—"}
    </Badge>
  );
}
