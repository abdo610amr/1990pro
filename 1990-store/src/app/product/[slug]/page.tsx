import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/product-detail";
import { catalogApi } from "@/lib/api-client";
import { adaptProducts } from "@/lib/catalog-adapter";
import { getProductBySlug } from "@/lib/catalog-utils";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

async function getCatalogProducts() {
  const [products, categories, brands, reviews] = await Promise.all([
    catalogApi.products(),
    catalogApi.categories(),
    catalogApi.brands(),
    catalogApi.reviews(),
  ]);
  return adaptProducts(products, categories, brands, reviews);
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(await getCatalogProducts(), slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(await getCatalogProducts(), slug);
  if (!product) notFound();

  return <ProductDetail product={product} />;
}
