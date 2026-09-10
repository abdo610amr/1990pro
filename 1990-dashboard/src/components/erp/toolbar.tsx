"use client";

import { RefreshCcw, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ErpToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  onRefresh,
  refreshing,
  left,
  right,
  filters,
  className,
}: {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
  left?: React.ReactNode;
  right?: React.ReactNode;
  filters?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3 rounded-2xl border bg-card/80 p-3 shadow-sm backdrop-blur", className)}>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {left}
          {typeof search === "string" && onSearchChange && (
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-11 pl-9"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
              />
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {right}
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={refreshing}>
              <RefreshCcw className={cn("h-4 w-4", refreshing && "animate-spin")} />
              Refresh
            </Button>
          )}
        </div>
      </div>
      {filters && (
        <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
          {filters}
        </div>
      )}
    </div>
  );
}
