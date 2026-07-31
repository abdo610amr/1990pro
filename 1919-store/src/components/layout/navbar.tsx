"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { useAuthStore } from "@/store/auth-store";
import { NAV_LINKS } from "@/lib/constants";
import { SearchDialog } from "@/components/shared/search-dialog";
import { BrandLogo } from "@/components/shared/brand-logo";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const cartCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.getCount());
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 right-0 left-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-background/95 shadow-sm backdrop-blur-md"
            : "bg-transparent"
        )}
      >
        <nav className="luxury-container flex h-16 items-center justify-between md:h-20">
          <div className="flex items-center gap-8">
            <Sheet>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                }
              />
              <SheetContent side="left" className="w-80 p-0">
                <MobileNav onClose={() => {}} />
              </SheetContent>
            </Sheet>

            <Link href="/" aria-label="1990 home">
              <BrandLogo priority className="h-10 w-32 md:h-12 md:w-40" />
            </Link>

            <div className="hidden items-center gap-1 lg:flex">
              {NAV_LINKS.map((link) => (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => setActiveMenu(link.label)}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <Link
                    href={link.href}
                    className="flex items-center gap-1 px-4 py-2 text-sm tracking-wide transition-colors hover:text-primary"
                  >
                    {link.label}
                    {link.children && <ChevronDown className="h-3 w-3" />}
                  </Link>
                  <AnimatePresence>
                    {link.children && activeMenu === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 min-w-[200px] rounded-xl border bg-background p-2 shadow-lg"
                      >
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block rounded-lg px-4 py-2.5 text-sm transition-colors hover:bg-secondary"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>

            <Link href={isAuthenticated ? "/account" : "/auth/login"}>
              <Button variant="ghost" size="icon" aria-label="Account">
                <User className="h-5 w-5" />
              </Button>
            </Link>

            <Link href="/account/wishlist" className="relative">
              <Button variant="ghost" size="icon" aria-label="Wishlist">
                <Heart className="h-5 w-5" />
              </Button>
              {wishlistCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-[10px]">
                  {wishlistCount}
                </Badge>
              )}
            </Link>

            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon" aria-label="Cart">
                <ShoppingBag className="h-5 w-5" />
              </Button>
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-[10px]">
                  {cartCount}
                </Badge>
              )}
            </Link>
          </div>
        </nav>
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

function MobileNav({ onClose }: { onClose: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b p-4">
        <BrandLogo className="h-10 w-32" />
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {NAV_LINKS.map((link) => (
          <div key={link.href} className="border-b border-border/50">
            {link.children ? (
              <>
                <button
                  onClick={() =>
                    setExpanded(expanded === link.label ? null : link.label)
                  }
                  className="flex w-full items-center justify-between py-4 text-sm tracking-wide"
                >
                  {link.label}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      expanded === link.label && "rotate-180"
                    )}
                  />
                </button>
                {expanded === link.label && (
                  <div className="pb-4 pl-4">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block py-2 text-sm text-muted-foreground"
                        onClick={onClose}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                href={link.href}
                className="block py-4 text-sm tracking-wide"
                onClick={onClose}
              >
                {link.label}
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
