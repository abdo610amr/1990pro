import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ProductCard } from "@/components/products/ProductCard";
import { Reveal } from "@/components/ui/Reveal";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useCart } from "@/context/CartContext";
import { productService } from "@/services/products";
import { categoryService } from "@/services/categories";
import {
  formatCurrency,
  getMaxQuantity,
  getProductVariants,
  isVariantAvailable,
} from "@/lib/utils";

export function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const { addItem } = useCart();

  const fetchProduct = useCallback(
    () => productService.getById(productId),
    [productId]
  );
  const { data: product, loading, error, refetch } = useAsyncData(fetchProduct);
  const { data: allProducts } = useAsyncData(productService.getAll);
  const { data: categories } = useAsyncData(categoryService.getAll);

  const variants = product ? getProductVariants(product) : [];

  useEffect(() => {
    if (variants[0]) {
      setSelectedVariant(variants[0].label);
    }
  }, [product?.id]);

  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const activeVariant = selectedVariant || variants[0]?.label || "";
  const variantOption = variants.find((v) => v.label === activeVariant);
  const maxQty = product ? getMaxQuantity(product, activeVariant) : 0;
  const isSoldOut = product?.stockStatus === "sold_out";
  const variantSoldOut = variantOption ? variantOption.stock <= 0 : true;

  const category = categories?.find((c) => c.id === product?.categoryId);

  const related =
    allProducts
      ?.filter(
        (p) =>
          p.id !== productId &&
          (p.categoryId === product?.categoryId ||
            p.tags.some((t) => product?.tags.includes(t)))
      )
      .slice(0, 4) ?? [];

  useEffect(() => {
    setQuantity(1);
  }, [activeVariant]);

  const handleAddToCart = () => {
    if (!product || !variantOption || variantOption.stock <= 0) return;
    addItem({
      productId: product.id,
      name: product.name,
      size: variantOption.label,
      price: variantOption.price,
      quantity,
      coverImage: product.coverImage,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return <LoadingState message="Loading product..." />;
  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <ErrorState message={error} onRetry={refetch} />
      </div>
    );
  }
  if (!product) return null;

  const variantLabel = product.variantLabel ?? "Size";

  return (
    <div className="animate-fade-in mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:text-primary">Shop</Link>
        {category && (
          <>
            <span className="mx-2">/</span>
            <Link
              to={`/shop?category=${encodeURIComponent(category.slug)}`}
              className="hover:text-primary"
            >
              {category.name}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="animate-fade-up">
          <ProductGallery
            coverImage={product.coverImage}
            gallery={product.gallery}
            productName={product.name}
          />
        </div>

        <div className="animate-fade-up flex flex-col" style={{ animationDelay: "120ms" }}>
          <div className="flex flex-wrap gap-2">
            {category && (
              <Link
                to={`/shop?category=${encodeURIComponent(category.slug)}`}
                className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                {category.name}
              </Link>
            )}
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-secondary px-3 py-1 text-xs font-medium capitalize text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="font-display mt-4 text-3xl font-bold md:text-4xl">{product.name}</h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">{product.description}</p>

          {isSoldOut && (
            <p className="mt-4 rounded-lg bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive">
              This product is currently sold out.
            </p>
          )}

          <p className="mt-6 font-display text-3xl font-bold">
            {variantOption ? formatCurrency(variantOption.price) : "—"}
          </p>

          <div className="mt-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider">
              {variantLabel}
            </p>
            <div className="flex flex-wrap gap-2">
              {variants.map((v) => {
                const outOfStock = v.stock <= 0;
                return (
                  <button
                    key={v.label}
                    type="button"
                    disabled={outOfStock}
                    onClick={() => setSelectedVariant(v.label)}
                    className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
                      activeVariant === v.label
                        ? "scale-105 border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border hover:-translate-y-0.5 hover:border-primary"
                    }`}
                  >
                    {v.label}
                    {outOfStock && " (Out)"}
                  </button>
                );
              })}
            </div>
            {variantOption && !variantSoldOut && (
              <p className="mt-2 text-xs text-muted-foreground">
                {variantOption.stock} in stock
                {variantOption.stock <= (product.lowStockThreshold ?? 5) && " — low stock"}
              </p>
            )}
          </div>

          <div className="mt-6">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider">Quantity</p>
            <div className="inline-flex items-center rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-3 hover:bg-muted"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[3rem] text-center font-medium">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                disabled={quantity >= maxQty}
                className="p-3 hover:bg-muted disabled:opacity-40"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!variantOption || variantSoldOut || !isVariantAvailable(product, activeVariant)}
            className={`shine-on-hover mt-8 flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-semibold transition-all duration-300 hover:scale-[1.02] disabled:scale-100 disabled:opacity-50 sm:w-auto sm:px-10 ${
              added
                ? "bg-emerald-600 text-white"
                : "bg-primary text-primary-foreground hover:opacity-95"
            }`}
          >
            {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
            {added ? "Added to Bag!" : variantSoldOut ? "Sold Out" : "Add to Cart"}
          </button>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display mb-8 text-2xl font-bold">Related Products</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
            {related.map((p, i) => (
              <Reveal key={p.id} delay={i * 80}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
