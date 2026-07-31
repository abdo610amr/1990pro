import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  FolderTree,
  LayoutDashboard,
  Megaphone,
  Menu,
  Moon,
  Package,
  PanelTop,
  Search,
  ShoppingCart,
  Star,
  Sun,
  Ticket,
  Warehouse,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useStoreName, useStoreTagline } from "@/hooks/useStoreSettings";
import { useUiStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const navGroups = [
  {
    label: "Workspace",
    items: [
      { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
      { to: "/orders", label: "Orders", icon: ShoppingCart },
      { to: "/notifications", label: "Notifications", icon: Bell },
    ],
  },
  {
    label: "Commerce",
    items: [
      { to: "/products", label: "Products", icon: Package },
      { to: "/categories", label: "Categories", icon: FolderTree },
      { to: "/inventory", label: "Inventory", icon: Warehouse },
      { to: "/coupons", label: "Coupons", icon: Ticket },
      { to: "/reviews", label: "Reviews", icon: Star },
    ],
  },
  {
    label: "Storefront",
    items: [
      { to: "/popup", label: "Popup Manager", icon: PanelTop },
      { to: "/announcement", label: "Announcement Bar", icon: Megaphone },
    ],
  },
];

const routeTitles: Record<string, string> = {
  "/": "Overview",
  "/products": "Products",
  "/categories": "Categories",
  "/inventory": "Inventory",
  "/orders": "Orders",
  "/coupons": "Coupons",
  "/reviews": "Reviews",
  "/popup": "Popup Manager",
  "/announcement": "Announcement Bar",
  "/notifications": "Notifications",
  "/demo-mode": "Catalog Configuration",
};

interface SidebarProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

export function Sidebar({ mobile = false, onNavigate }: SidebarProps) {
  const storeName = useStoreName();
  const tagline = useStoreTagline();
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const isCollapsed = collapsed && !mobile;

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 88 : 280 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "flex h-full flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        !mobile && "fixed inset-y-0 left-0 z-30"
      )}
    >
      <div className={cn("flex h-20 shrink-0 items-center gap-3 px-5", isCollapsed && "justify-center px-3")}>
        <span className="shrink-0 transition-transform duration-300 hover:scale-105">
          <BrandLogo compact={isCollapsed} />
        </span>
        {!isCollapsed && (
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em]">{storeName} Admin</p>
            <p className="truncate text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/55">
              {tagline}
            </p>
          </div>
        )}
      </div>

      <Separator className="bg-sidebar-border" />

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!isCollapsed && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/35">
                {group.label}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={onNavigate}
                  aria-label={label}
                  title={isCollapsed ? label : undefined}
                  className={({ isActive }) =>
                    cn(
                      "group relative flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all duration-200",
                      isCollapsed && "justify-center",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                        : "text-sidebar-foreground/68 hover:bg-sidebar-accent/55 hover:text-sidebar-accent-foreground"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={cn(
                          "absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-sidebar-primary transition-all",
                          isActive ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"
                        )}
                      />
                      <Icon className="h-[18px] w-[18px] shrink-0 transition-transform group-hover:scale-105" />
                      {!isCollapsed && <span className="truncate">{label}</span>}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        {!mobile && (
          <button
            type="button"
            onClick={toggleSidebar}
            className={cn(
              "flex h-10 w-full items-center gap-3 rounded-xl px-3 text-xs text-sidebar-foreground/55 transition-colors hover:bg-sidebar-accent/55 hover:text-sidebar-foreground",
              isCollapsed && "justify-center"
            )}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!isCollapsed && <span>Collapse navigation</span>}
          </button>
        )}
        {!isCollapsed && (
          <div className="mt-2 flex items-center gap-2 px-3 py-2 text-[10px] uppercase tracking-wider text-sidebar-foreground/35">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.8)]" />
            Backend connected
          </div>
        )}
      </div>
    </motion.aside>
  );
}

export function AdminLayout() {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const mobileOpen = useUiStore((state) => state.mobileMenuOpen);
  const setMobileOpen = useUiStore((state) => state.setMobileMenuOpen);
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const pageTitle = useMemo(
    () => routeTitles[location.pathname] ?? "1990 Admin",
    [location.pathname]
  );

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="relative h-full w-[min(86vw,300px)]"
          >
            <Sidebar mobile onNavigate={() => setMobileOpen(false)} />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-4 text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close navigation</span>
            </Button>
          </motion.div>
        </div>
      )}

      <div
        className={cn(
          "min-h-screen transition-[padding] duration-300 lg:pl-[280px]",
          collapsed && "lg:pl-[88px]"
        )}
      >
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border/70 bg-background/80 px-4 backdrop-blur-xl sm:px-6 lg:h-20 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open navigation</span>
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-lg font-semibold tracking-tight sm:text-xl">{pageTitle}</p>
            <p className="hidden text-xs text-muted-foreground sm:block">1990 Commerce Command Center</p>
          </div>

          <div className={cn("relative hidden w-full max-w-xs md:block", searchOpen && "md:block")}>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Search dashboard"
              placeholder="Search workspace…"
              className="h-10 rounded-xl border-border/70 bg-card/70 pl-9 shadow-none"
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setSearchOpen(false)}
            />
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Search">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle color theme">
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <NotificationBell />
        </header>

        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8 xl:p-10">
          <div key={location.pathname} className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
