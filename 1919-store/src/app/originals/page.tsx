import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { ProductCard } from "@/components/shared/product-card";
import { Button } from "@/components/ui/button";
import { catalogApi } from "@/lib/api-client";
import { adaptProducts } from "@/lib/catalog-adapter";
import { getProductsByType } from "@/lib/catalog-utils";

export const metadata = {
  title: "Originals",
  description: "Official 1990 products — luxury fashion made for originals.",
};

export const dynamic = "force-dynamic";

export default async function OriginalsPage() {
  const [backendProducts, categories, brands] = await Promise.all([
    catalogApi.products(),
    catalogApi.categories(),
    catalogApi.brands(),
  ]);
  const products = getProductsByType(
    adaptProducts(backendProducts, categories, brands),
    "originals"
  );

  return (
    <div className="luxury-container luxury-section">
      <PageBreadcrumb items={[{ label: "Originals" }]} />

      <section className="relative mb-16 overflow-hidden rounded-3xl">
        <div className="relative aspect-[21/9] min-h-[300px]">
          <Image
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=700&fit=crop"
            alt="1990 Originals"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="p-8 md:p-16">
              <p className="luxury-subheading text-white/70">Official</p>
              <h1 className="mt-2 font-heading text-4xl font-light text-white md:text-6xl">
                1990 Originals
              </h1>
              <p className="mt-4 max-w-md text-white/80">
                Exclusive pieces designed and crafted by 1990. Timeless luxury
                for those who define their own path.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {products.length} products
          </p>
        </div>
        <Link href="/shop?tab=originals">
          <Button variant="outline" className="rounded-full">
            Shop All Originals
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} priority={i < 4} />
        ))}
      </div>
    </div>
  );
}
