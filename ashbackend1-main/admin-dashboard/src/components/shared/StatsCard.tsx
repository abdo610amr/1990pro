import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: string;
  className?: string;
  style?: CSSProperties;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  style,
}: StatsCardProps) {
  return (
    <Card
      style={style}
      className={cn(
        "hover-lift group relative overflow-hidden",
        className
      )}
    >
      {/* subtle accent glow that intensifies on hover */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/5 blur-2xl transition-all duration-500 group-hover:bg-primary/15" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {(description || trend) && (
          <p className="mt-1 text-xs text-muted-foreground">{trend ?? description}</p>
        )}
      </CardContent>
    </Card>
  );
}
