import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, Users } from "lucide-react";
import { SocialLinks } from "@/components/shared/social-links";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { ProductCard } from "@/components/shared/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { catalogApi } from "@/lib/api-client";
import { adaptBrands, adaptProducts } from "@/lib/catalog-adapter";
import { getProductsByBrand } from "@/lib/catalog-utils";
import { formatFollowers } from "@/lib/format";

interface BrandStorePageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

async function getBrandStore(slug: string) {
  const [backendProducts, categories, backendBrands] = await Promise.all([
    catalogApi.products(),
    catalogApi.categories(),
    catalogApi.brands(),
  ]);
  const brands = adaptBrands(backendBrands);
  const brand = brands.find((item) => item.slug === slug);
  const products = brand
    ? getProductsByBrand(
        adaptProducts(backendProducts, categories, backendBrands),
        brand.id
      )
    : [];
  return { brand, products };
}

export async function generateMetadata({ params }: BrandStorePageProps) {
  const { slug } = await params;
  const { brand } = await getBrandStore(slug);
  if (!brand) return { title: "Brand Not Found" };
  return {
    title: brand.name,
    description: brand.about,
  };
}

export default async function BrandStorePage({ params }: BrandStorePageProps) {
  const { slug } = await params;
  const { brand, products } = await getBrandStore(slug);
  if (!brand) notFound();
  const bestSellers = products.filter((p) => p.isBestSeller);
  const newArrivals = products.filter((p) => p.isNew);

  return (
    <div>
      <div className="relative h-[50vh] min-h-[400px]">
        <Image
          src={brand.coverImage}
          alt={brand.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute right-0 bottom-0 left-0">
          <div className="luxury-container pb-12">
            <div className="flex items-end gap-6">
              <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-white/30 md:h-24 md:w-24">
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="font-heading text-3xl font-light text-white md:text-5xl">
                  {brand.name}
                </h1>
                <p className="mt-1 text-white/70">{brand.story}</p>
                <div className="mt-3 flex items-center gap-4 text-sm text-white/80">
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-white text-white" />
                    {brand.rating}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {formatFollowers(brand.followers)} followers
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="luxury-container luxury-section">
        <PageBreadcrumb
          items={[
            { label: "Showroom", href: "/showroom" },
            { label: brand.name },
          ]}
        />

        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="font-heading text-2xl font-light">About</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {brand.about}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {brand.categories.map((cat) => (
                <Badge key={cat} variant="secondary">
                  {cat}
                </Badge>
              ))}
            </div>

            <Tabs defaultValue="all" className="mt-12">
              <TabsList className="rounded-full">
                <TabsTrigger value="all" className="rounded-full">
                  All ({products.length})
                </TabsTrigger>
                <TabsTrigger value="bestsellers" className="rounded-full">
                  Best Sellers
                </TabsTrigger>
                <TabsTrigger value="new" className="rounded-full">
                  New Arrivals
                </TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-8">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="bestsellers" className="mt-8">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
                  {bestSellers.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="new" className="mt-8">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
                  {newArrivals.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border p-6">
              <h3 className="text-sm font-medium tracking-wider uppercase">
                Connect
              </h3>
              <SocialLinks
                className="mt-4 gap-3"
                iconClassName="h-4 w-4"
                instagram={brand.socialLinks.instagram}
                twitter={brand.socialLinks.twitter}
                website={brand.socialLinks.website}
              />
              <Link href={`/shop?brand=${brand.id}`}>
                <Button className="mt-6 w-full rounded-full">
                  Shop All Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
