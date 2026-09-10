"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Heart,
  ShoppingBag,
  Star,
  Truck,
  RotateCcw,
  Shield,
  Minus,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { ProductCard } from "@/components/shared/product-card";
import { ProductCarousel } from "@/components/shared/product-carousel";
import type { Product } from "@/types";
import { formatPrice, calculateDiscount, formatDate } from "@/lib/format";
import {
  SHIPPING_COST,
  EXPRESS_SHIPPING_COST,
  FREE_SHIPPING_THRESHOLD,
} from "@/lib/constants";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { useRecentlyViewedStore } from "@/store/recent-store";
import { getRelatedProducts, getProductById } from "@/lib/catalog-utils";
import { useCatalog } from "@/providers/catalog-provider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { catalogApi } from "@/lib/api-client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const { products, refresh } = useCatalog();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name ?? "");
  const [selectedSize, setSelectedSize] = useState(
    product.sizes.find((s) => s.inStock)?.label ?? ""
  );
  const [quantity, setQuantity] = useState(1);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  const addToCart = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id));
  const addRecentlyViewed = useRecentlyViewedStore((s) => s.addProduct);
  const recentIds = useRecentlyViewedStore((s) => s.productIds);

  useEffect(() => {
    addRecentlyViewed(product.id);
  }, [product.id, addRecentlyViewed]);

  const selectedPrice =
    product.sizes.find((size) => size.label === selectedSize)?.price ??
    product.price;
  const selectedStock =
    product.sizes.find((size) => size.label === selectedSize)?.stock ?? 0;
  const discount = calculateDiscount(selectedPrice, product.compareAtPrice);
  const related = getRelatedProducts(products, product);
  const recentlyViewed = recentIds
    .filter((id) => id !== product.id)
    .map((id) => getProductById(products, id))
    .filter(Boolean)
    .slice(0, 4) as Product[];

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    addToCart({
      productId: product.id,
      quantity,
      size: selectedSize,
      color: selectedColor,
      name: product.name,
      image: product.images[0],
      unitPrice:
        product.sizes.find((size) => size.label === selectedSize)?.price ??
        product.price,
    });
    toast.success(`${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    window.location.href = "/checkout";
  };

  return (
    <div className="luxury-container luxury-section">
      <PageBreadcrumb
        items={[
          { label: "Shop", href: "/shop" },
          { label: product.name },
        ]}
      />

      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <div
            className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-secondary"
            onMouseEnter={() => setZoomed(true)}
            onMouseLeave={() => setZoomed(false)}
          >
            <Image
              src={product.images[selectedImage]}
              alt={product.name}
              fill
              priority
              className={cn(
                "object-cover transition-transform duration-500",
                zoomed && "scale-110"
              )}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {product.isNew && (
              <Badge className="absolute top-4 left-4">New</Badge>
            )}
            {discount > 0 && (
              <Badge className="absolute top-4 right-4 bg-primary">
                -{discount}%
              </Badge>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    "relative aspect-square w-20 overflow-hidden rounded-lg border-2 transition-colors",
                    selectedImage === i
                      ? "border-primary"
                      : "border-transparent hover:border-border"
                  )}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href={`/shop?brand=${product.brandName.toLowerCase().replace(/\s+/g, "-")}`}
            className="inline-flex items-center gap-2 text-xs tracking-wider text-muted-foreground uppercase hover:text-primary transition-colors font-semibold"
          >
            {product.brandLogo && (
              <Image
                src={product.brandLogo}
                alt={product.brandName}
                width={20}
                height={20}
                className="rounded-full object-cover border"
              />
            )}
            <span>{product.brandName}</span>
          </Link>
          <h1 className="mt-2 font-heading text-3xl font-light md:text-4xl">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < Math.floor(product.rating)
                      ? "fill-primary text-primary"
                      : "text-border"
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {product.rating} ({product.reviewCount} reviews)
            </span>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <span className="text-2xl font-medium">
              {formatPrice(selectedPrice)}
            </span>
            {product.compareAtPrice && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          <p className="mt-4 leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <Separator className="my-8" />

          <div className="space-y-6">
            <div>
              <label className="mb-3 block text-sm font-medium">Color</label>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={cn(
                      "flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors",
                      selectedColor === color.name
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary"
                    )}
                  >
                    <span
                      className="h-4 w-4 rounded-full border"
                      style={{ backgroundColor: color.hex }}
                    />
                    {color.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium">Size</label>
              <div className="space-y-2">
                {product.sizes.map((size) => {
                  const availability =
                    size.availability ??
                    (size.stock != null && size.stock <= 0
                      ? "out_of_stock"
                      : size.stock != null &&
                          size.stock <= (product.lowStockThreshold ?? 5)
                        ? "low_stock"
                        : size.inStock
                          ? "available"
                          : "out_of_stock");
                  const statusLabel =
                    availability === "out_of_stock"
                      ? "Out Of Stock"
                      : availability === "low_stock"
                        ? "Low Stock"
                        : "Available";
                  return (
                    <button
                      key={size.label}
                      type="button"
                      disabled={!size.inStock}
                      onClick={() => {
                        setSelectedSize(size.label);
                        setQuantity((current) =>
                          Math.min(current, size.stock ?? 1)
                        );
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                        selectedSize === size.label
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary",
                        !size.inStock && "cursor-not-allowed opacity-50"
                      )}
                    >
                      <span className="font-medium">{size.label}</span>
                      <span className="flex items-center gap-3 text-xs">
                        <span className="tabular-nums text-muted-foreground">
                          {size.stock ?? 0}
                        </span>
                        <span
                          className={cn(
                            "font-medium uppercase tracking-wide",
                            availability === "out_of_stock" && "text-destructive",
                            availability === "low_stock" && "text-amber-700",
                            availability === "available" && "text-emerald-700"
                          )}
                        >
                          {statusLabel}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
              {!product.inStock && (
                <p className="mt-3 text-sm font-medium text-destructive">
                  OUT OF STOCK — all sizes unavailable
                </p>
              )}
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium">Quantity</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="rounded-full"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  className="rounded-full"
                  disabled={quantity >= selectedStock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="flex-1 rounded-full"
              onClick={handleAddToCart}
              disabled={!selectedSize || selectedStock <= 0}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              {selectedStock <= 0 ? "Out Of Stock" : "Add to Cart"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="flex-1 rounded-full"
              onClick={handleBuyNow}
              disabled={!selectedSize || selectedStock <= 0}
            >
              Buy Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full"
              onClick={() => {
                toggleWishlist(product.id);
                toast.success(
                  isInWishlist ? "Removed from wishlist" : "Added to wishlist"
                );
              }}
            >
              <Heart
                className={cn(
                  "h-4 w-4",
                  isInWishlist && "fill-primary text-primary"
                )}
              />
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 rounded-2xl bg-secondary/50 p-4">
            <div className="text-center">
              <Truck className="mx-auto h-5 w-5 text-muted-foreground" />
              <p className="mt-2 text-xs text-muted-foreground">Free shipping over {formatPrice(FREE_SHIPPING_THRESHOLD)}</p>
            </div>
            <div className="text-center">
              <RotateCcw className="mx-auto h-5 w-5 text-muted-foreground" />
              <p className="mt-2 text-xs text-muted-foreground">30-day returns</p>
            </div>
            <div className="text-center">
              <Shield className="mx-auto h-5 w-5 text-muted-foreground" />
              <p className="mt-2 text-xs text-muted-foreground">Authentic guarantee</p>
            </div>
          </div>

          <Accordion className="mt-8">
            <AccordionItem value="description">
              <AccordionTrigger>Description</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {product.longDescription}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="fabric">
              <AccordionTrigger>Fabric & Care</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p>{product.fabric}</p>
                <p className="mt-2">Dry clean recommended. Store on padded hanger.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping">
              <AccordionTrigger>Shipping & Returns</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p>Standard shipping: 3-5 business days ({formatPrice(SHIPPING_COST)}, free over {formatPrice(FREE_SHIPPING_THRESHOLD)}).</p>
                <p className="mt-2">Express shipping: 1-2 business days ({formatPrice(EXPRESS_SHIPPING_COST)}).</p>
                <p className="mt-2">Returns accepted within 30 days in original condition.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="reviews">
              <AccordionTrigger>
                Reviews ({product.reviewCount})
              </AccordionTrigger>
              <AccordionContent>
                {product.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {product.reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{review.author}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(review.date)}
                          </span>
                        </div>
                        <div className="mt-1 flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-3 w-3",
                                i < review.rating
                                  ? "fill-primary text-primary"
                                  : "text-border"
                              )}
                            />
                          ))}
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {review.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No reviews yet.</p>
                )}

                <form
                  className="mt-6 space-y-3 border-t pt-4"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    if (!reviewName.trim()) {
                      toast.error("Please enter your name");
                      return;
                    }
                    setSubmittingReview(true);
                    try {
                      await catalogApi.createReview({
                        product_id: Number(product.id),
                        name: reviewName.trim(),
                        rating: reviewRating,
                        comment: reviewComment.trim() || undefined,
                      });
                      setReviewComment("");
                      await refresh();
                      toast.success("Review submitted — visible in Admin");
                    } catch (error) {
                      toast.error(
                        error instanceof Error
                          ? error.message
                          : "Unable to submit review"
                      );
                    } finally {
                      setSubmittingReview(false);
                    }
                  }}
                >
                  <p className="text-sm font-medium">Write a review</p>
                  <Input
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="Your name"
                    required
                  />
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setReviewRating(i + 1)}
                        className="p-0.5"
                        aria-label={`Rate ${i + 1} stars`}
                      >
                        <Star
                          className={cn(
                            "h-4 w-4",
                            i < reviewRating
                              ? "fill-primary text-primary"
                              : "text-border"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                  <Textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your thoughts"
                    rows={3}
                  />
                  <Button type="submit" disabled={submittingReview}>
                    {submittingReview ? "Submitting…" : "Submit review"}
                  </Button>
                </form>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </motion.div>
      </div>

      {related.length > 0 && (
        <div className="mt-24">
          <ProductCarousel
            products={related}
            title="You May Also Like"
            subtitle="Related Products"
          />
        </div>
      )}

      {recentlyViewed.length > 0 && (
        <div className="mt-16">
          <h2 className="luxury-heading mb-8">Recently Viewed</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {recentlyViewed.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
