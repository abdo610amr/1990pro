import { PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
        <PackageOpen className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="font-heading text-xl font-light">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="mt-6">
          <Button className="rounded-full px-8">{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}
