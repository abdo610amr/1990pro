"use client";

import Link from "next/link";
import { Package, Heart, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWishlistStore } from "@/store/wishlist-store";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";

export default function AccountDashboard() {
  const wishlistCount = useWishlistStore((s) => s.getCount());
  const cartCount = useCartStore((s) => s.getItemCount());
  const addressCount = useAuthStore((s) => s.addresses.length);

  const stats = [
    { label: "Cart Items", value: cartCount, icon: Package, href: "/cart" },
    { label: "Wishlist", value: wishlistCount, icon: Heart, href: "/account/wishlist" },
    { label: "Addresses", value: addressCount, icon: MapPin, href: "/account/addresses" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-medium">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="rounded-2xl border p-8">
        <h2 className="font-heading text-xl font-light">Recent Activity</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You haven&apos;t placed any orders yet. Start shopping to see your order history here.
        </p>
        <Link href="/shop">
          <Button className="mt-6 rounded-full">
            Start Shopping
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
