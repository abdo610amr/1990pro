interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-border/70 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/70">
          1990 Administration
        </p>
        <h1 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {description && (
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
