"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import { formatPrice } from "@/lib/format";

const statusColors = {
  pending: "secondary",
  preparing: "secondary",
  ready: "default",
  completed: "default",
  cancelled: "destructive",
  returned: "destructive",
  // Legacy aliases
  confirmed: "secondary",
  prepared: "secondary",
  processing: "secondary",
  shipped: "default",
  delivered: "default",
} as const;

export default function OrdersPage() {
  const token = useAuthStore((state) => state.token);
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["account", "orders"],
    queryFn: () => authApi.orders(token!),
    enabled: Boolean(token),
  });

  if (!isLoading && orders.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        description="When you place an order, it will appear here."
        actionLabel="Shop Now"
        actionHref="/shop"
      />
    );
  }

  return (
    <div>
      <h2 className="font-heading text-xl font-light mb-6">Order History</h2>
      <div className="space-y-4">
        {orders.map((order) => {
          const status = order.status as keyof typeof statusColors;
          return (
          <div
            key={order.id}
            className="flex flex-col gap-4 rounded-2xl border p-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium">1990-{order.id}</p>
              <p className="text-sm text-muted-foreground">
                {order.items.length} item{order.items.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={statusColors[status] ?? "secondary"}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
              <span className="font-medium">{formatPrice(order.totalPrice)}</span>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}
