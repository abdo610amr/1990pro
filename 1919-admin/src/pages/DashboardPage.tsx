import {
  Package,
  ShoppingCart,
  Star,
  DollarSign,
  AlertTriangle,
  Ban,
} from "lucide-react";
import { orderService } from "@/services/orders";
import { statsService } from "@/services/stats";
import { useAsyncData } from "@/hooks/useAsyncData";
import { HeroBanner } from "@/components/brand/HeroBanner";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsCard } from "@/components/shared/StatsCard";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { AnalyticsOverview } from "@/components/analytics/AnalyticsOverview";

export function DashboardPage() {
  const stats = useAsyncData(statsService.get);
  const orders = useAsyncData(orderService.getAll);

  const loading = stats.loading || orders.loading;
  const error = stats.error ?? orders.error;

  const recentOrders = (orders.data ?? []).slice(0, 5);

  const refetchAll = () => {
    void stats.refetch();
    void orders.refetch();
  };

  if (loading) return <LoadingState variant="page" />;

  if (error) return <ErrorState message={error} onRetry={refetchAll} />;

  const data = stats.data!;

  return (
    <div className="space-y-8">
      <HeroBanner />

      <PageHeader
        title="Commerce overview"
        description="A live view of revenue, fulfillment, catalog health and customer activity."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Orders"
          value={data.totalOrders}
          icon={ShoppingCart}
          className="animate-fade-up"
          style={{ animationDelay: "0ms" }}
        />
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(data.totalRevenue)}
          icon={DollarSign}
          className="animate-fade-up"
          style={{ animationDelay: "60ms" }}
        />
        <StatsCard
          title="Total Products"
          value={data.totalProducts}
          icon={Package}
          className="animate-fade-up"
          style={{ animationDelay: "120ms" }}
        />
        <StatsCard
          title="Total Reviews"
          value={data.totalReviews}
          icon={Star}
          className="animate-fade-up"
          style={{ animationDelay: "180ms" }}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard
          title="Low Stock"
          value={data.lowStockProducts}
          icon={AlertTriangle}
          description="Products below threshold"
          className="animate-fade-up"
          style={{ animationDelay: "0ms" }}
        />
        <StatsCard
          title="Sold Out"
          value={data.soldOutProducts}
          icon={Ban}
          description="Out of stock products"
          className="animate-fade-up"
          style={{ animationDelay: "60ms" }}
        />
        <StatsCard
          title="Pending Orders"
          value={data.pendingOrders}
          icon={ShoppingCart}
          description="Awaiting confirmation"
          className="animate-fade-up"
          style={{ animationDelay: "120ms" }}
        />
      </div>

      <AnalyticsOverview orders={orders.data ?? []} stats={data} />

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Recent orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentOrders.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.items?.length ?? 0}</TableCell>
                    <TableCell>
                      {formatCurrency(Number(order.totalPrice))}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
