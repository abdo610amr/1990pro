import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Upload } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { orderService } from "@/services/orders";
import { getApiErrorMessage } from "@/services/api";
import { formatCurrency } from "@/lib/utils";

type PaymentMethod = "cash" | "instapay";

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, total, appliedPromo, clearCart } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center md:px-6">
        <h1 className="font-display text-2xl font-bold">Your cart is empty</h1>
        <Link to="/shop" className="mt-4 inline-block text-primary hover:underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshot(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (paymentMethod === "instapay" && !screenshot) {
      setError("Please upload your InstaPay payment screenshot.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await orderService.create({
        customerName,
        email,
        phone,
        address,
        totalPrice: total,
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          size: i.size,
          variant: i.size,
          quantity: i.quantity,
          price: i.price,
        })),
        promoCode: appliedPromo?.code,
        discount: appliedPromo?.discount,
        promoType: appliedPromo?.type,
        paymentMethod: paymentMethod === "instapay" ? "instapay" : "cash",
        screenshot: screenshot ?? undefined,
      });

      clearCart();
      navigate(`/order-success/${response.orderId}`);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
      <h1 className="font-display mb-8 text-3xl font-bold">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {/* Customer Information */}
          <section className="rounded-2xl border border-border p-6">
            <h2 className="font-display mb-6 text-xl font-semibold">Customer Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
                  Full Name *
                </label>
                <input
                  id="name"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
                />
              </div>
              <div>
                <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">
                  Phone *
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="address" className="mb-1.5 block text-sm font-medium">
                  Address *
                </label>
                <textarea
                  id="address"
                  required
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
                />
              </div>
            </div>
          </section>

          {/* Payment Methods */}
          <section className="rounded-2xl border border-border p-6">
            <h2 className="font-display mb-6 text-xl font-semibold">Payment Method</h2>
            <div className="space-y-3">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-4 transition has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <input
                  type="radio"
                  name="payment"
                  value="cash"
                  checked={paymentMethod === "cash"}
                  onChange={() => setPaymentMethod("cash")}
                  className="accent-primary"
                />
                <div>
                  <p className="font-medium">Cash on Delivery</p>
                  <p className="text-sm text-muted-foreground">Pay when your order arrives</p>
                </div>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-4 transition has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <input
                  type="radio"
                  name="payment"
                  value="instapay"
                  checked={paymentMethod === "instapay"}
                  onChange={() => setPaymentMethod("instapay")}
                  className="accent-primary"
                />
                <div>
                  <p className="font-medium">InstaPay</p>
                  <p className="text-sm text-muted-foreground">Transfer and upload payment proof</p>
                </div>
              </label>
            </div>

            {paymentMethod === "instapay" && (
              <div className="mt-6">
                <label className="mb-2 block text-sm font-medium">
                  Upload Payment Screenshot *
                </label>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-8 transition hover:border-primary hover:bg-primary/5">
                  <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload screenshot
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {preview && (
                  <img
                    src={preview}
                    alt="Payment preview"
                    className="mt-4 max-h-48 rounded-xl border border-border object-contain"
                  />
                )}
              </div>
            )}
          </section>
        </div>

        <div className="h-fit rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display mb-4 text-xl font-semibold">Order Summary</h2>
          <ul className="mb-4 space-y-3 border-b border-border pb-4">
            {items.map((item) => (
              <li
                key={`${item.productId}-${item.size}`}
                className="flex justify-between text-sm"
              >
                <span className="text-muted-foreground">
                  {item.name} ({item.size}) × {item.quantity}
                </span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          {appliedPromo && (
            <div className="mb-2 flex justify-between text-sm text-primary">
              <span>Discount</span>
              <span>-{formatCurrency(appliedPromo.discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Placing Order...
              </>
            ) : (
              "Place Order"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
