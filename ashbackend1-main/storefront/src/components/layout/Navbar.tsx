import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { SearchBar } from "@/components/shop/SearchBar";
import { useCart } from "@/context/CartContext";
import { useStoreName } from "@/hooks/useStoreSettings";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/track-order", label: "Track Order" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const storeName = useStoreName();
  const { itemCount, openDrawer } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b transition-all duration-300",
        scrolled
          ? "border-border/60 bg-background/85 shadow-sm backdrop-blur-xl"
          : "border-transparent bg-background/60 backdrop-blur-md"
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 transition-all duration-300 md:px-6",
          scrolled ? "h-14" : "h-16"
        )}
      >
        <Link to="/" className="group flex items-center gap-3">
          <span className="transition-transform duration-300 group-hover:scale-105">
            <BrandLogo />
          </span>
          <div className="hidden sm:block">
            <p className="font-display text-lg font-bold leading-none">{storeName}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "group relative rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  <span
                    className={cn(
                      "absolute inset-x-3 -bottom-px h-0.5 origin-left rounded-full bg-primary transition-transform duration-300",
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    )}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={openDrawer}
            className="group relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-5 w-5 transition-transform duration-300 group-hover:scale-110 group-active:scale-90" />
            {itemCount > 0 && (
              <span
                key={itemCount}
                className="animate-pop absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
              >
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="animate-fade-in border-t border-border px-4 py-3 md:hidden">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          {searchQuery && (
            <Link
              to={`/shop?q=${encodeURIComponent(searchQuery)}`}
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery("");
              }}
              className="mt-2 block text-sm text-primary"
            >
              Search for &ldquo;{searchQuery}&rdquo;
            </Link>
          )}
        </div>
      )}

      {mobileOpen && (
        <nav className="animate-fade-in border-t border-border px-4 py-3 md:hidden">
          {NAV_LINKS.map((link, i) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              style={{ animationDelay: `${i * 50}ms` }}
              className={({ isActive }) =>
                cn(
                  "animate-fade-up block rounded-lg px-4 py-3 text-sm font-medium",
                  isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
