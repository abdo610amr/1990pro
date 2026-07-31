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
        "relative overflow-hidden rounded-3xl border border-primary/15 bg-primary text-primary-foreground shadow-[0_22px_60px_-34px_rgba(94,15,29,.75)]",
        hero.image ? "min-h-[180px]" : "px-6 py-8 sm:px-8 sm:py-10",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -right-6 -top-4 h-40 w-40 rounded-full border border-white/10" />
      {hero.image && (
        <>
          <img
            src={hero.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/85 to-primary/20" />
        </>
      )}

      <div className={cn("relative max-w-2xl", hero.image && "px-6 py-10 sm:px-8")}>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-primary-foreground/55">
          1990 Commerce
        </p>
        <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">{hero.title}</h2>
        {hero.subtitle && (
          <p className="mt-2 text-sm leading-relaxed text-primary-foreground/65">{hero.subtitle}</p>
        )}
      </div>
    </section>
  );
}
