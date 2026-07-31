import { PackageOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title?: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

export function EmptyState({
  title = "Nothing here yet",
  message,
  actionLabel,
  actionHref = "/shop",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center",
        className
      )}
    >
      <PackageOpen className="h-12 w-12 text-muted-foreground" />
      <div>
        <h3 className="font-display text-xl font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </div>
      {actionLabel && (
        <Link
          to={actionHref}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
