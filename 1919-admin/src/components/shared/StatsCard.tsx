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
        "hover-lift group relative overflow-hidden border-border/70",
        className
      )}
    >
      {/* subtle accent glow that intensifies on hover */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/5 blur-2xl transition-all duration-500 group-hover:bg-primary/15" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 transition-all duration-300 group-hover:scale-105 group-hover:bg-primary/15">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="font-serif text-3xl font-semibold tracking-tight">{value}</div>
        {(description || trend) && (
          <p className="mt-1 text-xs text-muted-foreground">{trend ?? description}</p>
        )}
      </CardContent>
    </Card>
  );
}
