"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Barcode,
  BarChart3,
  Bell,
  ChartColumn,
  ClipboardList,
  FolderTree,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Moon,
  Package,
  PanelTop,
  RefreshCcw,
  Settings,
  ShieldAlert,
  ShoppingCart,
  Star,
  Store,
  Sun,
  Ticket,
  Users,
  Warehouse,
  Clock3,
  Wifi,
  WifiOff,
  Tags,
  LineChart,
} from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SITE_NAME, SITE_SLOGAN } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useOfflineStore } from "@/store/offline-store";
import { useShiftStore } from "@/store/shift-store";
import { useCartStore } from "@/store/cart-store";
import { filterNavByRole, type Permission } from "@/lib/permissions";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: Permission;
};

type NavSection = { title: string; items: NavItem[] };

const navSections: NavSection[] = [
  {
    title: "Operations",
    items: [
      { href: "/dashboard/", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard.view" },
      { href: "/sell/", label: "POS", icon: ShoppingCart, permission: "pos.sell" },
      { href: "/orders/", label: "Orders", icon: ClipboardList, permission: "orders.manage" },
      { href: "/returns/", label: "Returns", icon: RefreshCcw, permission: "returns.manage" },
      { href: "/shifts/", label: "Shifts", icon: Clock3, permission: "shifts.manage" },
      { href: "/barcodes/", label: "Barcodes", icon: Barcode, permission: "pos.sell" },
    ],
  },
  {
    title: "Catalog",
    items: [
      { href: "/products/", label: "Products", icon: Package, permission: "catalog.manage" },
      { href: "/inventory/", label: "Inventory", icon: Warehouse, permission: "inventory.manage" },
      { href: "/categories/", label: "Categories", icon: FolderTree, permission: "catalog.manage" },
      { href: "/brands/", label: "Brands", icon: Tags, permission: "catalog.manage" },
    ],
  },
  {
    title: "CRM & Staff",
    items: [
      { href: "/customers/", label: "Customers", icon: Users, permission: "customers.view" },
      { href: "/users/", label: "Users Management", icon: Users, permission: "users.manage" },
      { href: "/seller-performance/", label: "Seller Performance", icon: LineChart, permission: "seller_performance.view" },
      { href: "/coupons/", label: "Coupons", icon: Ticket, permission: "marketing.manage" },
      { href: "/reviews/", label: "Reviews", icon: Star, permission: "reviews.manage" },
      { href: "/announcements/", label: "Announcements", icon: Megaphone, permission: "marketing.manage" },
      { href: "/popup/", label: "Popup Manager", icon: PanelTop, permission: "marketing.manage" },
    ],
  },
  {
    title: "Insights",
    items: [
      { href: "/reports/", label: "Reports & Stats", icon: BarChart3, permission: "reports.view" },
      { href: "/brand-reports/", label: "Brand Analytics", icon: LineChart, permission: "seller_performance.view" },
      { href: "/audit/", label: "Audit Log", icon: ShieldAlert, permission: "audit.view" },
      { href: "/analytics/", label: "Analytics", icon: LineChart, permission: "reports.view" },
      { href: "/notifications/", label: "Notifications", icon: Bell, permission: "notifications.manage" },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/media/", label: "Media", icon: ImageIcon, permission: "media.view" },
      { href: "/settings/", label: "Settings", icon: Settings, permission: "settings.manage" },
    ],
  },
];

export function PosShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const userName = useAuthStore((state) => state.displayName());
  const role = useAuthStore((state) => state.role);
  const logout = useAuthStore((state) => state.logout);
  const token = useAuthStore((state) => state.token);
  const online = useOfflineStore((state) => state.online);
  const queue = useOfflineStore((state) => state.queue);
  const shift = useShiftStore((state) => state.current);
  const cartCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (!token) router.replace("/login/");
  }, [router, token]);

  useEffect(() => {
    const stored = localStorage.getItem("1990-pos-theme");
    const enabled = stored === "dark";
    setDark(enabled);
    document.documentElement.classList.toggle("dark", enabled);
  }, []);

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

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 flex h-screen w-[270px] shrink-0 flex-col border-r border-border bg-[#3B0912] text-[#F7F3EC]">
        <div className="flex items-center gap-3 px-5 py-5">
          <BrandLogo className="h-11 w-36 rounded-xl" priority />
        </div>
        <div className="px-5 pb-3">
          <p className="font-heading text-2xl tracking-[0.18em]">{SITE_NAME}</p>
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/50">
            {SITE_SLOGAN}
          </p>
          <p className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-white/40">
            <Store className="h-3 w-3" /> POS + Management
          </p>
        </div>
        <nav className="flex-1 space-y-4 overflow-y-auto px-3 pb-4">
          {navSections.map((section) => {
            const items = filterNavByRole(section.items, role);
            if (!items.length) return null;
            return (
              <div key={section.title}>
                <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                  {section.title}
                </p>
                <div className="space-y-1">
                  {items.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href || pathname.startsWith(href);
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={cn(
                          "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all",
                          active
                            ? "bg-[#5E0F1D] text-white shadow-sm"
                            : "text-white/65 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        <Icon className="h-[18px] w-[18px]" />
                        {label}
                        {href === "/sell/" && cartCount > 0 && (
                          <Badge className="ml-auto bg-white text-primary">
                            {cartCount}
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-4">
          <p className="truncate text-sm font-medium">{userName}</p>
          <div className="mt-1 flex items-center gap-2">
            <Badge
              className={cn(
                "text-[10px] uppercase font-semibold border-0",
                role === "admin" ? "bg-amber-400 text-black" : "bg-white/20 text-white"
              )}
            >
              {role === "admin" ? "Admin" : "Seller"}
            </Badge>
            {role === "seller" && (
              <span className="text-[11px] text-white/60">
                Max discount limit
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            className="mt-3 w-full justify-start text-white/70 hover:bg-white/10 hover:text-white"
            onClick={() => {
              logout();
              router.replace("/login/");
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border/80 bg-background/85 px-6 backdrop-blur-xl">
          <div>
            <p className="font-heading text-xl">1990 Management</p>
            <p className="text-xs text-muted-foreground">
              {shift
                ? `Shift open · ${shift.cashierName}`
                : "No shift open — open a shift before selling"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={online ? "success" : "warning"} className="gap-1 normal-case">
              {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {online ? "Online" : "Offline"}
            </Badge>
            {queue.length > 0 && (
              <Badge variant="outline">{queue.length} queued</Badge>
            )}
            <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push("/sell/")}>
              Open POS
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 xl:p-8">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
