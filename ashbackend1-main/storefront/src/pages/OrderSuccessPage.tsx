import { Link, useParams } from "react-router-dom";
import { CheckCircle, Package } from "lucide-react";

export function OrderSuccessPage() {
  const { orderId } = useParams<{ orderId: string }>();

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-16 text-center md:py-24">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <CheckCircle className="h-10 w-10 text-primary" />
      </div>
      <h1 className="font-display text-3xl font-bold">Order Placed Successfully!</h1>
      <p className="mt-3 text-muted-foreground">
        Thank you for your purchase. We&apos;ve received your order and will process it shortly.
      </p>

      {orderId && (
        <div className="mt-8 w-full rounded-2xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Order Number</p>
          <p className="font-display mt-1 text-3xl font-bold text-primary">#{orderId}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Save this number to track your order
          </p>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          to={`/track-order?order=${orderId ?? ""}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          <Package className="h-4 w-4" />
          Track Order
        </Link>
        <Link
          to="/shop"
          className="inline-flex items-center justify-center rounded-xl border border-border px-6 py-3 text-sm font-semibold transition hover:bg-muted"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
