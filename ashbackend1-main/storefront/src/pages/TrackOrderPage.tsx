import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, Search } from "lucide-react";
import { OrderTracker } from "@/components/orders/OrderTracker";
import { ErrorState } from "@/components/ui/ErrorState";
import { orderService } from "@/services/orders";
import { getApiErrorMessage } from "@/services/api";
import type { Order } from "@/types/order";
import { formatCurrency } from "@/lib/utils";

export function TrackOrderPage() {
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get("order") ?? "");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotFound(false);
    setOrder(null);

    try {
      const result = await orderService.track(Number(orderNumber), phone);
      if (!result) {
        setNotFound(true);
      } else {
        setOrder(result);
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold md:text-4xl">Track Your Order</h1>
        <p className="mt-2 text-muted-foreground">
          Enter your order number and phone to see the current status
        </p>
      </div>

      <form
        onSubmit={handleTrack}
        className="mx-auto mb-10 max-w-md space-y-4 rounded-2xl border border-border bg-card p-6"
      >
        <div>
          <label htmlFor="orderNumber" className="mb-1.5 block text-sm font-medium">
            Order Number
          </label>
          <input
            id="orderNumber"
            type="number"
            required
            min={1}
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="e.g. 4"
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone used at checkout"
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Search className="h-4 w-4" />
              Track Order
            </>
          )}
        </button>
      </form>

      {error && <ErrorState message={error} className="mb-6" />}

      {notFound && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
          <p className="font-medium">Order not found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Please check your order number and phone number and try again.
          </p>
        </div>
      )}

      {order && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Order Number</p>
                <p className="font-semibold">#{order.id}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="font-semibold">{formatCurrency(order.totalPrice)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Customer</p>
                <p className="font-semibold">{order.customerName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Items</p>
                <p className="font-semibold">{order.items.length} item(s)</p>
              </div>
            </div>
          </div>
          <OrderTracker order={order} />
        </div>
      )}
    </div>
  );
}
