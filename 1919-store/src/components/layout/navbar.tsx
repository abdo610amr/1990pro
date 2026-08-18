"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cart-store";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [solid, setSolid] = useState(false);
  const cartCount = useCartStore((s) => s.getItemCount());

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        solid
          ? "bg-background/92 border-b border-border backdrop-blur-sm shadow-md"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <nav className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-5 md:px-12">
        {/* LEFT: 1990 LOGO */}
        <Link
          href="/"
          aria-label="1990 home"
          className="display text-2xl leading-none text-primary uppercase"
        >
          1990
        </Link>

        {/* CENTER / NAVIGATION: SHOP (Desktop) */}
        <div className="hidden items-center justify-center lg:flex">
          <Link
            href="/shop"
            className="label relative text-primary/80 transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-primary after:transition-transform after:duration-500 hover:text-primary hover:after:origin-left hover:after:scale-x-100"
          >
            SHOP
          </Link>
        </div>

        {/* RIGHT: SHOP (Mobile) + CART */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Mobile SHOP link */}
          <Link
            href="/shop"
            className="label text-primary/80 transition-colors hover:text-primary lg:hidden"
          >
            SHOP
          </Link>

          {/* CART */}
          <Link href="/cart" className="relative">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Cart"
              className="text-primary hover:bg-secondary"
            >
              <ShoppingBag className="h-5 w-5" />
            </Button>
            {cartCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-[9px] bg-primary text-primary-foreground font-mono">
                {cartCount}
              </Badge>
            )}
          </Link>
        </div>
      </nav>
    </header>
  );
}
