import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { BrandCard } from "@/components/shared/brand-card";
import { catalogApi } from "@/lib/api-client";
import { adaptBrands } from "@/lib/catalog-adapter";

export const metadata = {
  title: "Brands",
  description: "Discover premium local brands featured in the 1990 Showroom.",
};

export const dynamic = "force-dynamic";

export default async function BrandsPage() {
  const brands = adaptBrands(await catalogApi.brands());
  const featured = brands.filter((brand) => brand.featured);
  const showroomBrands = brands.filter((b) => b.slug !== "1990");

  return (
    <div className="luxury-container luxury-section">
      <PageBreadcrumb items={[{ label: "Brands" }]} />

      <div className="mb-16 text-center">
        <p className="luxury-subheading">Showroom</p>
        <h1 className="luxury-heading mt-2">Premium Brands</h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          A curated roster of local designers and labels — each with a dedicated
          storefront, story, and collection on the 1990 platform.
        </p>
      </div>

      <section className="mb-16">
        <h2 className="mb-8 font-heading text-2xl font-light">Featured</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured
            .filter((b) => b.slug !== "1990")
            .map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
        </div>
      </section>

      <section>
        <h2 className="mb-8 font-heading text-2xl font-light">All Brands</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {showroomBrands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </div>
      </section>
    </div>
  );
}
