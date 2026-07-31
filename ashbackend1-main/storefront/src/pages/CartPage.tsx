import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { CouponForm } from "@/components/cart/CouponForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { useCart } from "@/context/CartContext";
import { usePlatformConfig } from "@/hooks/usePlatformConfig";
import { formatCurrency } from "@/lib/utils";

export function CartPage() {
  const {
    items,
    subtotal,
    total,
    appliedPromo,
    updateQuantity,
    removeItem,
  } = useCart();
  const { config } = usePlatformConfig();
  const variantLabel = config?.variantLabel ?? "Size";

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <h1 className="font-display mb-8 text-3xl font-bold">Your Cart</h1>
        <EmptyState
          title="Your cart is empty"
          message="Discover our luxury fragrances and add your favorites."
          actionLabel="Start Shopping"
          actionHref="/shop"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
      <h1 className="font-display mb-8 text-3xl font-bold">Your Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ul className="divide-y divide-border rounded-2xl border border-border">
            {items.map((item) => (
              <li
                key={`${item.productId}-${item.size}`}
                className="flex gap-4 p-4 md:p-6"
              >
                <img
                  src={item.coverImage}
                  alt={item.name}
                  className="h-28 w-20 rounded-xl object-cover md:h-32 md:w-24"
                />
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-2">
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {variantLabel}: {item.size}
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId, item.size)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="flex items-center rounded-xl border border-border">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.productId, item.size, item.quantity - 1)
                        }
                        className="p-2 hover:bg-muted"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-[2rem] text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.productId, item.size, item.quantity + 1)
                        }
                        className="p-2 hover:bg-muted"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="font-semibold">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="h-fit rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display mb-4 text-xl font-semibold">Order Summary</h2>
          <CouponForm showEmail className="mb-6" />
          <div className="space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {appliedPromo && (
              <div className="flex justify-between text-primary">
                <span>Discount ({appliedPromo.code})</span>
                <span>-{formatCurrency(appliedPromo.discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
          <Link
            to="/checkout"
            className="mt-6 block w-full rounded-xl bg-primary py-3.5 text-center text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Proceed to Checkout
          </Link>
          <Link
            to="/shop"
            className="mt-3 block text-center text-sm text-muted-foreground hover:text-primary"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
