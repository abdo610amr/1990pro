import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductGridSkeleton } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Reveal } from "@/components/ui/Reveal";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { useHeroBanner, usePromoBanner, useStoreName } from "@/hooks/useStoreSettings";
import type { Category } from "@/types/product";
import type { HomeSection, PlatformConfig } from "@/types/platform";
import type { Product } from "@/types/product";

interface HomeSectionsProps {
  config: PlatformConfig;
  products: Product[] | null;
  categories: Category[] | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

function SectionHeading({
  eyebrow,
  title,
  align = "left",
  viewAllHref,
}: {
  eyebrow: string;
  title: string;
  align?: "left" | "center";
  viewAllHref?: string;
}) {
  return (
    <Reveal
      className={
        align === "center"
          ? "mb-8 text-center"
          : "mb-8 flex items-end justify-between gap-4"
      }
    >
      <div className={align === "center" ? "inline-block" : ""}>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          {eyebrow}
        </p>
        <h2 className="font-display text-3xl font-bold">{title}</h2>
        <span
          className={
            "mt-3 block h-1 rounded-full bg-primary/70 " +
            (align === "center" ? "mx-auto w-12" : "w-12")
          }
        />
      </div>
      {viewAllHref && align === "left" && (
        <Link
          to={viewAllHref}
          className="group hidden items-center gap-1 text-sm font-medium text-primary sm:flex"
        >
          View all
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      )}
    </Reveal>
  );
}

function ProductSection({
  eyebrow,
  title,
  products,
  loading,
  error,
  onRetry,
  viewAllHref = "/shop",
}: {
  eyebrow: string;
  title: string;
  products: Product[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  viewAllHref?: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <SectionHeading eyebrow={eyebrow} title={title} viewAllHref={viewAllHref} />
      {loading && <ProductGridSkeleton count={4} />}
      {error && <ErrorState message={error} onRetry={onRetry} />}
      {!loading && !error && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
          {products.map((product, i) => (
            <Reveal key={product.id} delay={i * 80}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}

function CategoriesSection({ categories }: { categories: Category[] }) {
  const displayCategories = categories.filter((cat) => cat.active !== false).slice(0, 6);

  if (!displayCategories.length) return null;

  return (
    <section className="bg-muted/50 py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading eyebrow="Explore" title="Shop by Category" align="center" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {displayCategories.map((cat, i) => (
            <Reveal key={cat.id} delay={i * 70}>
              <Link
                to={`/shop?category=${encodeURIComponent(cat.slug)}`}
                className="hover-lift group flex h-full flex-col items-center rounded-2xl border border-border bg-card p-6 text-center hover:border-primary"
              >
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                  {cat.name.charAt(0)}
                </div>
                <p className="font-semibold capitalize">{cat.name}</p>
                {cat.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {cat.description}
                  </p>
                )}
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function HeroSection({
  storeName,
  hero,
  fallback,
}: {
  storeName: string;
  hero: ReturnType<typeof useHeroBanner>;
  fallback: PlatformConfig["heroFallback"];
}) {
  return (
    <section className="relative overflow-hidden bg-sidebar text-sidebar-foreground">
      {hero?.image && (
        <img
          src={hero.image}
          alt=""
          className="absolute inset-0 h-full w-full scale-105 object-cover opacity-30"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-sidebar via-sidebar/95 to-sidebar/70" />

      {/* floating ambient orbs */}
      <div className="animate-float pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-sidebar-primary/20 blur-3xl" />
      <div
        className="animate-float pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-sidebar-primary/10 blur-3xl"
        style={{ animationDelay: "2s" }}
      />

      <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-20 md:px-6 md:py-28 lg:py-36">
        <div
          className="animate-fade-up flex items-center gap-2 rounded-full bg-sidebar-primary/20 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-sidebar-primary"
          style={{ animationDelay: "0ms" }}
        >
          <Sparkles className="h-3.5 w-3.5" />
          {storeName}
        </div>
        <h1
          className="font-display animate-fade-up max-w-2xl text-4xl font-bold leading-tight md:text-5xl lg:text-6xl"
          style={{ animationDelay: "100ms" }}
        >
          {hero?.title ?? fallback.title}
        </h1>
        <p
          className="animate-fade-up max-w-lg text-base text-sidebar-foreground/70 md:text-lg"
          style={{ animationDelay: "200ms" }}
        >
          {hero?.subtitle ?? fallback.subtitle}
        </p>
        <Link
          to="/shop"
          className="shine-on-hover animate-fade-up group inline-flex items-center gap-2 rounded-xl bg-sidebar-primary px-6 py-3 text-sm font-semibold text-sidebar-primary-foreground transition-transform duration-300 hover:scale-[1.03]"
          style={{ animationDelay: "300ms" }}
        >
          {fallback.cta}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}

function PromoSection({ promo }: { promo: ReturnType<typeof usePromoBanner> }) {
  if (!promo?.enabled) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
      <Reveal>
        <div className="relative overflow-hidden rounded-2xl bg-primary px-8 py-12 text-primary-foreground md:px-12">
          <div className="animate-float absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary-foreground/10" />
          <div
            className="animate-float absolute -bottom-12 -left-12 h-56 w-56 rounded-full bg-primary-foreground/5"
            style={{ animationDelay: "1.5s" }}
          />
          <div className="relative max-w-lg">
            <h2 className="font-display text-2xl font-bold md:text-3xl">{promo.title}</h2>
            <p className="mt-2 text-primary-foreground/80">{promo.subtitle}</p>
            <Link
              to="/shop"
              className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-foreground px-5 py-2.5 text-sm font-semibold text-primary transition-transform duration-300 hover:scale-[1.03]"
            >
              Shop Now
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function HomeSections({
  config,
  products,
  categories,
  loading,
  error,
  onRetry,
}: HomeSectionsProps) {
  const storeName = useStoreName();
  const hero = useHeroBanner();
  const promo = usePromoBanner();

  const featured = products?.filter((p) => p.tags.includes("bestseller")).slice(0, 4) ?? [];
  const latest = products?.slice(0, 4) ?? [];
  const newCollection = products?.filter((p) => p.tags.includes("new")).slice(0, 4) ?? [];
  const bestSellers =
    products?.filter((p) => p.tags.includes("bestseller")).slice(0, 4) ?? featured;

  const sectionContent: Record<HomeSection, React.ReactNode> = {
    hero: (
      <HeroSection
        key="hero"
        storeName={storeName}
        hero={hero}
        fallback={config.heroFallback}
      />
    ),
    featured: (
      <ProductSection
        key="featured"
        eyebrow="Curated"
        title="Featured Products"
        products={featured.length > 0 ? featured : latest}
        loading={loading}
        error={error}
        onRetry={onRetry}
      />
    ),
    categories: <CategoriesSection key="categories" categories={categories ?? []} />,
    newArrivals: (
      <ProductSection
        key="newArrivals"
        eyebrow="New Arrivals"
        title="Latest Products"
        products={latest}
        loading={loading}
        error={null}
        onRetry={onRetry}
      />
    ),
    promo: <PromoSection key="promo" promo={promo} />,
    newCollection: (
      <ProductSection
        key="newCollection"
        eyebrow="Just Dropped"
        title="New Collection"
        products={newCollection.length > 0 ? newCollection : latest}
        loading={loading}
        error={error}
        onRetry={onRetry}
      />
    ),
    bestSellers: (
      <ProductSection
        key="bestSellers"
        eyebrow="Top Picks"
        title="Best Sellers"
        products={bestSellers.length > 0 ? bestSellers : latest}
        loading={loading}
        error={null}
        onRetry={onRetry}
      />
    ),
    newsletter: <NewsletterSection key="newsletter" />,
  };

  return <>{config.homeSections.map((section) => sectionContent[section])}</>;
}
