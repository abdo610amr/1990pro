import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Ticket,
  Star,
  FolderTree,
  Warehouse,
  Megaphone,
  PanelTop,
  Sparkles,
  Bell,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useStoreName, useStoreTagline, useHeroBanner } from "@/hooks/useStoreSettings";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/products", label: "Products", icon: Package },
  { to: "/categories", label: "Categories", icon: FolderTree },
  { to: "/inventory", label: "Inventory", icon: Warehouse },
  { to: "/orders", label: "Orders", icon: ShoppingCart },
  { to: "/coupons", label: "Coupons", icon: Ticket },
  { to: "/reviews", label: "Reviews", icon: Star },
  { to: "/popup", label: "Popup Manager", icon: PanelTop },
  { to: "/announcement", label: "Announcement Bar", icon: Megaphone },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/demo-mode", label: "Demo Mode", icon: Sparkles },
];

export function Sidebar() {
  const storeName = useStoreName();
  const tagline = useStoreTagline();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-3 px-6">
        <span className="transition-transform duration-300 hover:scale-105">
          <BrandLogo />
        </span>
        <div>
          <p className="text-sm font-semibold">{storeName} Admin</p>
          <p className="text-xs text-sidebar-foreground/70">{tagline}</p>
        </div>
      </div>

      <Separator className="bg-sidebar-border" />

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:translate-x-0.5 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-sidebar-primary transition-all duration-300",
                    isActive ? "opacity-100" : "scale-y-0 opacity-0"
                  )}
                />
                <Icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <p className="text-xs text-sidebar-foreground/60">Connected to backend API</p>
      </div>
    </aside>
  );
}

export function AdminLayout() {
  const hero = useHeroBanner();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/80 px-8 backdrop-blur-xl">
          <p className="text-sm text-muted-foreground">
            {hero?.subtitle || "Manage your store from one place"}
          </p>
          <NotificationBell />
        </header>
        <main className="p-8">
          <div key={location.pathname} className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
