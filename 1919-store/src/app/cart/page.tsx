"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, Tag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageTransition } from "@/components/shared/page-transition";
import { EmptyState } from "@/components/shared/empty-state";
import { useCartStore } from "@/store/cart-store";
import { getProductById } from "@/lib/catalog-utils";
import { useCatalog } from "@/providers/catalog-provider";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";
import { useState } from "react";
import { addDays, format } from "date-fns";
export default function CartPage() {
  const { products } = useCatalog();
  const {
    items,
    updateQuantity,
    removeItem,
    getSubtotal,
    getShipping,
    getTax,
    getTotal,
    couponCode,
    applyCoupon,
    removeCoupon,
    couponDiscount,
  } = useCartStore();
  const [couponInput, setCouponInput] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const subtotal = getSubtotal();
  const shipping = getShipping();
  const tax = getTax();
  const total = getTotal();
  const discount = couponDiscount;
  const estimatedDelivery = format(addDays(new Date(), 5), "MMM d, yyyy");

  const handleApplyCoupon = async () => {
    setApplyingCoupon(true);
    if (await applyCoupon(couponInput)) {
      toast.success("Coupon applied successfully");
    } else {
      toast.error("Invalid coupon code");
    }
    setApplyingCoupon(false);
  };

  if (items.length === 0) {
    return (
      <PageTransition>
        <div className="luxury-container luxury-section">
          <PageBreadcrumb items={[{ label: "Cart" }]} />
          <EmptyState
            title="Your cart is empty"
            description="Discover our latest collections and add items to your cart."
            actionLabel="Continue Shopping"
            actionHref="/shop"
          />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="luxury-container luxury-section">
        <PageBreadcrumb items={[{ label: "Cart" }]} />
        <h1 className="luxury-heading mb-10">Shopping Cart</h1>

        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => {
              const product = getProductById(products, item.productId);
              const name = product?.name ?? item.name ?? "Product";
              const image = product?.images[0] ?? item.image ?? "/brand-logo.png";
              const unitPrice = item.unitPrice ?? product?.price ?? 0;

              return (
                <div
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="flex gap-4 rounded-2xl border p-4 md:gap-6 md:p-6"
                >
                  <Link
                    href={product ? `/product/${product.slug}` : "/shop"}
                    className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-xl md:w-32"
                  >
                    <Image
                      src={image}
                      alt={name}
                      fill
                      className="object-cover"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-xs tracking-wider text-muted-foreground uppercase">
                          {product?.brandName ?? "1990"}
                        </p>
                        <Link
                          href={product ? `/product/${product.slug}` : "/shop"}
                          className="font-medium hover:text-primary"
                        >
                          {name}
                        </Link>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.color} / {item.size}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatPrice(unitPrice * item.quantity)}
                      </p>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.size,
                              item.color,
                              item.quantity - 1
                            )
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.size,
                              item.color,
                              item.quantity + 1
                            )
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          removeItem(item.productId, item.size, item.color)
                        }
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="h-fit rounded-2xl border p-6 lg:sticky lg:top-24">
            <h2 className="font-heading text-xl font-light">Order Summary</h2>

            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-brand-success">
                  <span>Discount ({couponCode})</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Estimated delivery: {estimatedDelivery}
            </p>

            <div className="mt-6">
              <div className="flex gap-2">
                <Input
                  placeholder="Coupon code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="rounded-full"
                />
                <Button
                  variant="outline"
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon || !couponInput.trim()}
                  className="shrink-0 rounded-full"
                >
                {applyingCoupon ? "..." : <Tag className="h-4 w-4" />}
                </Button>
              </div>
              {couponCode && (
                <button
                  onClick={removeCoupon}
                  className="mt-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Remove coupon ({couponCode})
                </button>
              )}
            </div>

            <Link href="/checkout" className="mt-6 block">
              <Button size="lg" className="w-full rounded-full">
                Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/shop" className="mt-3 block">
              <Button variant="outline" className="w-full rounded-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
