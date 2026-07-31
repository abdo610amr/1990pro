"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Banknote, CheckCircle, Truck, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageTransition } from "@/components/shared/page-transition";
import { EmptyState } from "@/components/shared/empty-state";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { getProductById } from "@/lib/catalog-utils";
import { commerceApi } from "@/lib/api-client";
import { useCatalog } from "@/providers/catalog-provider";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";
import { motion } from "framer-motion";

const checkoutSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Valid phone required"),
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(5, "Valid zip code required"),
  country: z.string().min(1, "Country is required"),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { products, refresh } = useCatalog();
  const { items, getSubtotal, getShipping, getTax, clearCart, couponDiscount } =
    useCartStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [step, setStep] = useState<"form" | "confirmation">("form");
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [orderNumber, setOrderNumber] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
  });

  const subtotal = getSubtotal();
  const shipping = shippingMethod === "express" ? 25 : getShipping();
  const tax = getTax();
  const discount = couponDiscount;
  const total = subtotal - discount + shipping + tax;

  if (items.length === 0 && step === "form") {
    return (
      <PageTransition>
        <div className="luxury-container luxury-section">
          <EmptyState
            title="Nothing to checkout"
            description="Your cart is empty. Add some items before checking out."
            actionLabel="Go to Shop"
            actionHref="/shop"
          />
        </div>
      </PageTransition>
    );
  }

  const onSubmit = async (data: CheckoutForm) => {
    try {
      if (paymentMethod === "instapay" && !paymentScreenshot) {
        toast.error("Please upload your InstaPay payment screenshot");
        return;
      }
      const formData = new FormData();
      formData.append("customerName", `${data.firstName} ${data.lastName}`);
      formData.append("email", data.email);
      formData.append("phone", data.phone);
      formData.append(
        "address",
        `${data.street}, ${data.city}, ${data.state} ${data.zipCode}, ${data.country}`
      );
      formData.append("totalPrice", String(total));
      formData.append("paymentMethod", paymentMethod);
      formData.append("source", "website");
      if (paymentScreenshot) {
        formData.append("screenshot", paymentScreenshot);
      }
      formData.append(
        "items",
        JSON.stringify(
          items.map((item) => {
            const product = getProductById(products, item.productId);
            return {
              productId: Number(item.productId),
              name: product?.name ?? item.name ?? "Product",
              variant: item.size,
              size: item.size,
              quantity: item.quantity,
              price: item.unitPrice ?? product?.price ?? 0,
            };
          })
        )
      );
      const { couponCode } = useCartStore.getState();
      if (couponCode) formData.append("promoCode", couponCode);
      if (discount > 0) formData.append("discount", String(discount));

      const result = await commerceApi.createOrder(formData);
      setOrderNumber(`1990-${result.orderId}`);
      setStep("confirmation");
      clearCart();
      await refresh();
      toast.success("Order placed successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to place order"
      );
    }
  };

  if (step === "confirmation") {
    return (
      <PageTransition>
        <div className="luxury-container luxury-section">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto max-w-lg text-center"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-success/10">
              <CheckCircle className="h-10 w-10 text-brand-success" />
            </div>
            <h1 className="luxury-heading">Order Confirmed</h1>
            <p className="mt-4 text-muted-foreground">
              Thank you for your order. Your order number is:
            </p>
            <p className="mt-2 text-xl font-medium">{orderNumber}</p>
            <p className="mt-4 text-sm text-muted-foreground">
              A confirmation email has been sent to your email address.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/shop">
                <Button className="rounded-full px-8">Continue Shopping</Button>
              </Link>
              <Link href="/account/orders">
                <Button variant="outline" className="rounded-full px-8">
                  View Orders
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="luxury-container luxury-section">
        <PageBreadcrumb
          items={[
            { label: "Cart", href: "/cart" },
            { label: "Checkout" },
          ]}
        />
        <h1 className="luxury-heading mb-10">Checkout</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <section className="rounded-2xl border p-6">
                <h2 className="font-heading text-xl font-light">
                  Shipping Address
                </h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" className="mt-1.5" {...register("firstName")} />
                    {errors.firstName && (
                      <p className="mt-1 text-xs text-destructive">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" className="mt-1.5" {...register("lastName")} />
                    {errors.lastName && (
                      <p className="mt-1 text-xs text-destructive">{errors.lastName.message}</p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" className="mt-1.5" {...register("email")} />
                    {errors.email && (
                      <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" className="mt-1.5" {...register("phone")} />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input id="street" className="mt-1.5" {...register("street")} />
                    {errors.street && (
                      <p className="mt-1 text-xs text-destructive">{errors.street.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" className="mt-1.5" {...register("city")} />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input id="state" className="mt-1.5" {...register("state")} />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input id="zipCode" className="mt-1.5" {...register("zipCode")} />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" defaultValue="United States" className="mt-1.5" {...register("country")} />
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border p-6">
                <h2 className="font-heading text-xl font-light">Shipping Method</h2>
                <RadioGroup
                  value={shippingMethod}
                  onValueChange={setShippingMethod}
                  className="mt-4 space-y-3"
                >
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-4 has-checked:border-primary has-checked:bg-primary/5">
                    <RadioGroupItem value="standard" />
                    <Truck className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Standard Shipping</p>
                      <p className="text-xs text-muted-foreground">3-5 business days</p>
                    </div>
                    <span className="text-sm">{shipping === 0 && shippingMethod === "standard" ? "Free" : "$15"}</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-4 has-checked:border-primary has-checked:bg-primary/5">
                    <RadioGroupItem value="express" />
                    <Truck className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Express Shipping</p>
                      <p className="text-xs text-muted-foreground">1-2 business days</p>
                    </div>
                    <span className="text-sm">$25</span>
                  </label>
                </RadioGroup>
              </section>

              <section className="rounded-2xl border p-6">
                <h2 className="font-heading text-xl font-light">Payment Method</h2>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="mt-4 space-y-3"
                >
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-4 has-checked:border-primary has-checked:bg-primary/5">
                    <RadioGroupItem value="cash" />
                    <Banknote className="h-5 w-5" />
                    <span className="text-sm font-medium">Cash on Delivery</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-4 has-checked:border-primary has-checked:bg-primary/5">
                    <RadioGroupItem value="instapay" />
                    <Upload className="h-5 w-5" />
                    <span className="text-sm font-medium">InstaPay Transfer</span>
                  </label>
                </RadioGroup>

                {paymentMethod === "instapay" && (
                  <div className="mt-6">
                    <Label htmlFor="payment-screenshot">
                      Payment Screenshot
                    </Label>
                    <Input
                      id="payment-screenshot"
                      type="file"
                      accept="image/*"
                      className="mt-1.5"
                      onChange={(event) =>
                        setPaymentScreenshot(event.target.files?.[0] ?? null)
                      }
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Upload the transfer receipt so the admin team can verify it.
                    </p>
                  </div>
                )}
              </section>
            </div>

            <div className="h-fit rounded-2xl border p-6 lg:sticky lg:top-24">
              <h2 className="font-heading text-xl font-light">Order Summary</h2>
              <div className="mt-6 space-y-4">
                {items.map((item) => {
                  const product = getProductById(products, item.productId);
                  const name = product?.name ?? item.name ?? "Product";
                  const image =
                    product?.images[0] ?? item.image ?? "/brand-logo.png";
                  const unitPrice = item.unitPrice ?? product?.price ?? 0;
                  return (
                    <div key={`${item.productId}-${item.size}`} className="flex gap-3">
                      <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg">
                        <Image src={image} alt={name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm">{name}</p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity} · {item.size}
                        </p>
                      </div>
                      <span className="text-sm">{formatPrice(unitPrice * item.quantity)}</span>
                    </div>
                  );
                })}
              </div>

              <Separator className="my-6" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-brand-success">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium text-base">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <Button type="submit" size="lg" className="mt-6 w-full rounded-full">
                Place Order · {formatPrice(total)}
              </Button>

              {!isAuthenticated && (
                <p className="mt-4 text-center text-xs text-muted-foreground">
                  Have an account?{" "}
                  <Link href="/auth/login" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </PageTransition>
  );
}
