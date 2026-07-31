import { useHeroBanner } from "@/hooks/useStoreSettings";
import { cn } from "@/lib/utils";

interface HeroBannerProps {
  className?: string;
}

export function HeroBanner({ className }: HeroBannerProps) {
  const hero = useHeroBanner();

  if (!hero?.enabled) return null;

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card",
        hero.image ? "min-h-[140px]" : "px-6 py-5",
        className
      )}
    >
      {hero.image && (
        <>
          <img
            src={hero.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-transparent" />
        </>
      )}

      <div className={cn("relative", hero.image && "px-6 py-8")}>
        <h2 className="text-lg font-semibold tracking-tight">{hero.title}</h2>
        {hero.subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{hero.subtitle}</p>
        )}
      </div>
    </section>
  );
}
