"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  LineChart,
  Package,
  Tags,
  FolderTree,
  ClipboardList,
  Warehouse,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  Store,
  Sun,
  Moon,
  Wifi,
  WifiOff,
  ShoppingBag,
  ShieldAlert,
  Globe,
} from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SITE_NAME, SITE_SLOGAN } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useOfflineStore } from "@/store/offline-store";
import { Forbidden403Screen } from "./forbidden";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

type NavSection = { title: string; items: NavItem[] };

const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/orders", label: "Orders", icon: ClipboardList },
    ],
  },
  {
    title: "Catalog & Stock",
    items: [
      { href: "/products", label: "Products", icon: Package },
      { href: "/brands", label: "Brands", icon: Tags },
      { href: "/categories", label: "Categories", icon: FolderTree },
      { href: "/inventory", label: "Inventory", icon: Warehouse },
    ],
  },
  {
    title: "People & Performance",
    items: [
      { href: "/users", label: "Sellers & Users", icon: Users },
      { href: "/seller-performance", label: "Seller Performance", icon: LineChart },
      { href: "/customers", label: "Customers", icon: ShoppingBag },
    ],
  },
  {
    title: "Analytics & System",
    items: [
      { href: "/reports", label: "Reports Center", icon: BarChart3 },
      { href: "/brand-analytics", label: "Brand Analytics", icon: LineChart },
      { href: "/notifications", label: "Notifications Log", icon: Bell },
      { href: "/settings", label: "System Settings", icon: Settings },
    ],
  },
  {
    title: "Website",
    items: [
      { href: "/website/homepage", label: "Homepage", icon: Globe },
    ],
  },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const userName = useAuthStore((state) => state.displayName());
  const role = useAuthStore((state) => state.role);
  const logout = useAuthStore((state) => state.logout);
  const token = useAuthStore((state) => state.token);
  const online = useOfflineStore((state) => state.online);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (!token) {
      router.replace("/login/");
    }
  }, [router, token]);

  useEffect(() => {
    const stored = localStorage.getItem("1990-pos-theme");
    const enabled = stored === "dark";
    setDark(enabled);
    document.documentElement.classList.toggle("dark", enabled);
  }, []);

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("1990-pos-theme", next ? "dark" : "light");
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Redirecting to login…
      </div>
    );
  }

  // 1. Strict Admin Only Guard
  if (role !== "admin") {
    return <Forbidden403Screen />;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="absolute left-0 top-0 bottom-0 w-[280px] max-w-[85vw] bg-[#3B0912] text-[#F7F3EC] p-4 flex flex-col shadow-2xl z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <BrandLogo className="h-10 w-32 rounded-xl" priority />
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 h-10 w-10"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <div className="py-3">
                <Badge className="bg-amber-400 text-black border-0 text-[10px] uppercase tracking-wider font-bold">
                  Admin Web Portal
                </Badge>
              </div>

              <nav className="flex-1 space-y-4 overflow-y-auto py-2">
                {navSections.map((section) => (
                  <div key={section.title}>
                    <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                      {section.title}
                    </p>
                    <div className="space-y-1">
                      {section.items.map(({ href, label, icon: Icon }) => {
                        const active = href === "/" ? (pathname === "/" || pathname === "/admin") : (pathname === href || pathname.startsWith(href) || pathname.startsWith("/admin" + href));
                        return (
                          <Link
                            key={href}
                            href={href}
                            className={cn(
                              "flex h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all min-h-[44px]",
                              active
                                ? "bg-[#5E0F1D] text-white shadow-sm font-semibold"
                                : "text-white/70 hover:bg-white/10 hover:text-white"
                            )}
                          >
                            <Icon className="h-5 w-5 shrink-0" />
                            {label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              <div className="border-t border-white/10 pt-3">
                <p className="truncate text-sm font-medium">{userName}</p>
                <p className="text-xs text-white/50 mb-3">System Administrator</p>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white/80 hover:bg-white/10 hover:text-white min-h-[44px]"
                  onClick={() => {
                    logout();
                    router.replace("/login/");
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" /> Sign out
                </Button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar (visible on lg: screens >=1024px) */}
      <aside className="hidden lg:flex sticky top-0 h-screen w-[270px] shrink-0 flex-col border-r border-border bg-[#3B0912] text-[#F7F3EC]">
        <div className="flex items-center gap-3 px-5 py-5">
          <BrandLogo className="h-11 w-36 rounded-xl" priority />
        </div>
        <div className="px-5 pb-3">
          <p className="font-heading text-2xl tracking-[0.18em]">{SITE_NAME}</p>
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/50">
            {SITE_SLOGAN}
          </p>
          <div className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-amber-400 font-semibold bg-white/10 px-2.5 py-1 rounded-full">
            <ShieldAlert className="h-3 w-3" /> Admin Web Control
          </div>
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto px-3 pb-4">
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map(({ href, label, icon: Icon }) => {
                  const active = href === "/" ? (pathname === "/" || pathname === "/admin") : (pathname === href || pathname.startsWith(href) || pathname.startsWith("/admin" + href));
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all",
                        active
                          ? "bg-[#5E0F1D] text-white shadow-sm font-semibold"
                          : "text-white/65 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <p className="truncate text-sm font-medium">{userName}</p>
          <Badge className="mt-1 bg-amber-400 text-black border-0 text-[10px] uppercase font-semibold">
            Admin
          </Badge>
          <Button
            variant="ghost"
            className="mt-3 w-full justify-start text-white/70 hover:bg-white/10 hover:text-white"
            onClick={() => {
              logout();
              router.replace("/login/");
            }}
          >
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border/80 bg-background/90 px-4 md:px-6 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden h-10 w-10 min-h-[40px] min-w-[40px]"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <p className="font-heading text-lg md:text-xl leading-tight">Admin Web Portal</p>
              <p className="text-[11px] text-muted-foreground hidden sm:block">
                Remote POS Management & Analytics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Badge variant={online ? "success" : "warning"} className="gap-1 normal-case text-xs">
              {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              <span className="hidden sm:inline">{online ? "Online" : "Offline"}</span>
            </Badge>

            <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="h-9 w-9">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Link href="/sell/">
              <Button variant="default" size="sm" className="gap-1.5 text-xs sm:text-sm min-h-[36px]">
                <Store className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">Open POS</span>
              </Button>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-5 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
