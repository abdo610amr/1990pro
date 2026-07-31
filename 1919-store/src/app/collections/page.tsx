import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { catalogApi } from "@/lib/api-client";
import { categoriesToCollections } from "@/lib/catalog-adapter";

export const metadata = {
  title: "Collections",
  description: "Explore curated luxury fashion collections at 1990.",
};

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const [categories, products] = await Promise.all([
    catalogApi.categories(),
    catalogApi.products(),
  ]);
  const collections = categoriesToCollections(categories, products);
  return (
    <div className="luxury-container luxury-section">
      <PageBreadcrumb items={[{ label: "Collections" }]} />

      <div className="mb-16 text-center">
        <p className="luxury-subheading">Curated Edits</p>
        <h1 className="luxury-heading mt-2">Collections</h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Seasonal edits and thematic capsules — thoughtfully assembled for
          those who appreciate refined simplicity.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {collections.map((collection) => (
          <Link
            key={collection.id}
            href={`/collections/${collection.slug}`}
            className="group relative aspect-[4/3] overflow-hidden rounded-2xl"
          >
            <Image
              src={collection.image}
              alt={collection.name}
              fill
              className="image-zoom object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute right-6 bottom-6 left-6">
              <h2 className="font-heading text-2xl font-light text-white md:text-3xl">
                {collection.name}
              </h2>
              <p className="mt-2 text-sm text-white/70 line-clamp-2">
                {collection.description}
              </p>
              <span className="mt-4 inline-flex items-center text-sm text-white group-hover:underline">
                View Collection
                <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
