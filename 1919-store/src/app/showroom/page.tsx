import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { BrandCard } from "@/components/shared/brand-card";
import { catalogApi } from "@/lib/api-client";
import { adaptBrands } from "@/lib/catalog-adapter";

export const metadata = {
  title: "Showroom",
  description: "Discover curated premium local brands at the 1990 Showroom.",
};

export const dynamic = "force-dynamic";

export default async function ShowroomPage() {
  const brands = adaptBrands(await catalogApi.brands());
  const featured = brands.filter((brand) => brand.featured);
  const allBrands = brands.filter((b) => b.slug !== "1990");

  return (
    <div className="luxury-container luxury-section">
      <PageBreadcrumb items={[{ label: "Showroom" }]} />

      <div className="mb-16 text-center">
        <p className="luxury-subheading">Curated Marketplace</p>
        <h1 className="luxury-heading mt-2">The Showroom</h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          A handpicked selection of premium local clothing brands. Each brand
          brings its unique vision, craftsmanship, and story to the 1990
          platform.
        </p>
      </div>

      <section className="mb-16">
        <h2 className="mb-8 font-heading text-2xl font-light">Featured Brands</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((brand) => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-8 font-heading text-2xl font-light">All Brands</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allBrands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </div>
      </section>
    </div>
  );
}
