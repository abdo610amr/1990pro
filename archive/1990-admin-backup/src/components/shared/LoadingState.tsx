import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface LoadingStateProps {
  rows?: number;
  variant?: "table" | "cards" | "page";
}

export function LoadingState({ rows = 5, variant = "table" }: LoadingStateProps) {
  if (variant === "cards") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (variant === "page") {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <LoadingState variant="cards" />
        <Card>
          <CardContent className="p-0">
            <LoadingState rows={6} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}
