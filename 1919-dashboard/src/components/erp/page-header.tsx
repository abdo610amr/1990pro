"use client";

import { cn } from "@/lib/utils";

export function ErpPageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-b border-border/70 pb-5 lg:flex-row lg:items-end lg:justify-between",
        className
      )}
    >
      <div>
        {eyebrow && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary/70">
            {eyebrow}
          </p>
        )}
        <h1 className="font-heading text-3xl tracking-tight md:text-4xl">{title}</h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
