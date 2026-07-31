"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  Heart,
  MapPin,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

const accountLinks = [
  { href: "/account", label: "Dashboard", icon: LayoutDashboard },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/profile", label: "Profile", icon: User },
  { href: "/account/settings", label: "Settings", icon: Settings },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="luxury-container luxury-section">
      <PageBreadcrumb items={[{ label: "My Account" }]} />

      <div className="mb-10">
        <h1 className="luxury-heading">
          Hello, {user?.firstName}
        </h1>
        <p className="mt-2 text-muted-foreground">{user?.email}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <nav className="space-y-1 rounded-2xl border p-2">
            {accountLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-secondary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </nav>
        </aside>
        <div className="lg:col-span-3">{children}</div>
      </div>
    </div>
  );
}
