import { Tag, Loader2, Check, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface CouponFormProps {
  className?: string;
  showEmail?: boolean;
}

export function CouponForm({ className, showEmail = false }: CouponFormProps) {
  const { appliedPromo, promoLoading, promoError, applyCoupon, removeCoupon } = useCart();
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    const success = await applyCoupon(code.trim(), email || undefined);
    if (success) setCode("");
  };

  if (appliedPromo) {
    return (
      <div
        className={cn(
          "flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-4 py-3",
          className
        )}
      >
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-primary" />
          <div>
            <p className="text-sm font-medium">{appliedPromo.code} applied</p>
            <p className="text-xs text-muted-foreground">
              You save {formatCurrency(appliedPromo.discount)}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={removeCoupon}
          className="text-muted-foreground hover:text-destructive"
          aria-label="Remove coupon"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleApply} className={cn("space-y-3", className)}>
      {showEmail && (
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email (for one-time promos)"
          className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
        />
      )}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Coupon code"
            className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-4 text-sm uppercase outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <button
          type="submit"
          disabled={promoLoading || !code.trim()}
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          {promoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
        </button>
      </div>
      {promoError && <p className="text-xs text-destructive">{promoError}</p>}
    </form>
  );
}
