import { notFound } from "next/navigation";
import Image from "next/image";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { ProductCard } from "@/components/shared/product-card";
import { catalogApi } from "@/lib/api-client";
import {
  adaptProducts,
  categoriesToCollections,
} from "@/lib/catalog-adapter";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

async function getCollectionData(slug: string) {
  const [backendProducts, categories, brands] = await Promise.all([
    catalogApi.products(),
    catalogApi.categories(),
    catalogApi.brands(),
  ]);
  const collection = categoriesToCollections(categories, backendProducts).find(
    (item) => item.slug === slug
  );
  const products = adaptProducts(
    backendProducts,
    categories,
    brands
  ).filter((product) => product.collection === slug);
  return { collection, products };
}

export async function generateMetadata({ params }: CollectionPageProps) {
  const { slug } = await params;
  const { collection } = await getCollectionData(slug);
  if (!collection) return { title: "Collection Not Found" };
  return {
    title: collection.name,
    description: collection.description,
  };
}

export default async function CollectionDetailPage({
  params,
}: CollectionPageProps) {
  const { slug } = await params;
  const { collection, products } = await getCollectionData(slug);
  if (!collection) notFound();

  return (
    <div>
      <div className="relative h-[45vh] min-h-[320px]">
        <Image
          src={collection.image}
          alt={collection.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-end">
          <div className="luxury-container pb-12">
            <p className="text-sm uppercase tracking-[0.2em] text-white/70">
              Collection
            </p>
            <h1 className="font-heading text-4xl font-light text-white md:text-5xl">
              {collection.name}
            </h1>
          </div>
        </div>
      </div>

      <div className="luxury-container luxury-section">
        <PageBreadcrumb
          items={[
            { label: "Collections", href: "/collections" },
            { label: collection.name },
          ]}
        />

        <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
          {collection.description}
        </p>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} priority={i < 4} />
          ))}
        </div>
      </div>
    </div>
  );
}
