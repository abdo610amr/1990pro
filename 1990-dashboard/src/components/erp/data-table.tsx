"use client";

import { cn } from "@/lib/utils";

export function ErpTable({
  children,
  density = "comfortable",
  className,
}: {
  children: React.ReactNode;
  density?: "compact" | "comfortable" | "spacious";
  className?: string;
}) {
  return (
    <div className={cn("overflow-auto rounded-2xl border bg-card shadow-sm", className)}>
      <table
        className={cn(
          "w-full min-w-[960px] text-left text-sm",
          density === "compact" && "[&_th]:px-2 [&_th]:py-2 [&_td]:px-2 [&_td]:py-2",
          density === "comfortable" && "[&_th]:px-3 [&_th]:py-3 [&_td]:px-3 [&_td]:py-3",
          density === "spacious" && "[&_th]:px-4 [&_th]:py-4 [&_td]:px-4 [&_td]:py-4"
        )}
      >
        {children}
      </table>
    </div>
  );
}

export function ErpTh({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "sticky top-0 z-10 border-b bg-secondary/80 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground backdrop-blur",
        className
      )}
    >
      {children}
    </th>
  );
}

export function ErpTd({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return <td className={cn("border-b border-border/60 align-middle", className)}>{children}</td>;
}

export function ErpPagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
      <p>
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        {onPageSizeChange && (
          <select
            className="h-9 rounded-lg border border-input bg-background px-2"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        )}
        <button
          type="button"
          className="h-9 rounded-lg border px-3 disabled:opacity-40"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Prev
        </button>
        <span className="px-1">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          className="h-9 rounded-lg border px-3 disabled:opacity-40"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
