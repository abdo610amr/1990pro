import { Link } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { usePlatformConfig } from "@/hooks/usePlatformConfig";
import { formatCurrency } from "@/lib/utils";
import { CouponForm } from "./CouponForm";

export function CartDrawer() {
  const {
    items,
    itemCount,
    subtotal,
    total,
    appliedPromo,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
  } = useCart();
  const { config } = usePlatformConfig();
  const variantLabel = config?.variantLabel ?? "Size";

  if (!isDrawerOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm"
        onClick={closeDrawer}
        aria-hidden
      />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            <h2 className="font-display text-xl font-semibold">
              Your Bag ({itemCount})
            </h2>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Your bag is empty</p>
              <Link
                to="/shop"
                onClick={closeDrawer}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
              >
                Browse Shop
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.size}`}
                  className="flex gap-3 rounded-xl border border-border p-3"
                >
                  <img
                    src={item.coverImage}
                    alt={item.name}
                    className="h-20 w-16 rounded-lg object-cover"
                  />
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {variantLabel}: {item.size}
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
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2 rounded-lg border border-border">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.productId, item.size, item.quantity - 1)
                          }
                          className="p-1.5 hover:bg-muted"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-[1.5rem] text-center text-sm">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.productId, item.size, item.quantity + 1)
                          }
                          className="p-1.5 hover:bg-muted"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-sm font-semibold">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="space-y-4 border-t border-border px-5 py-4">
            <CouponForm />
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-primary">
                  <span>Discount</span>
                  <span>-{formatCurrency(appliedPromo.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
            <Link
              to="/cart"
              onClick={closeDrawer}
              className="block w-full rounded-xl border border-border py-3 text-center text-sm font-medium transition hover:bg-muted"
            >
              View Cart
            </Link>
            <Link
              to="/checkout"
              onClick={closeDrawer}
              className="block w-full rounded-xl bg-primary py-3 text-center text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Checkout
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
