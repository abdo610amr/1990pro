"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Package,
  Users,
  Percent,
  AlertTriangle,
  Award,
  ArrowRight,
  RefreshCw,
  Building2,
  Calendar,
} from "lucide-react";
import { posApi } from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ErpPageHeader } from "@/components/erp/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/erp/status-badge";

export default function AdminDashboardPage() {
  const { data: stats, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["pos-stats-dashboard"],
    queryFn: posApi.stats,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-muted/60 rounded-2xl" />
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-28 bg-muted/50 rounded-2xl" />
          ))}
        </div>
        <div className="h-80 bg-muted/40 rounded-2xl" />
      </div>
    );
  }

  const salesOverTime = stats?.salesOverTime ?? [];
  const maxRevenue = Math.max(1, ...salesOverTime.map((d) => d.revenue));
  const recentOrders = stats?.recentOrders ?? [];
  const lowStockList = stats?.lowStockProductsList ?? [];
  const topSeller = stats?.topSellers?.topSeller;
  const topBrand = stats?.topBrand;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <ErpPageHeader
          eyebrow="Real-Time Business Overview"
          title="Admin Web Dashboard"
          description="Live remote monitoring & management for 1990 POS."
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="self-start sm:self-auto gap-2 min-h-[36px]"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          <span>Refresh Data</span>
        </Button>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-border/80 bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Today&apos;s Revenue</CardTitle>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold">{formatCurrency(stats?.todayRevenue ?? 0)}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              <span className="font-semibold text-foreground">{stats?.todaySales ?? 0}</span> sales completed today
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/80 bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Monthly Sales</CardTitle>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold">{formatCurrency(stats?.monthlySales ?? 0)}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Current month completed revenue</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/80 bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Lifetime Revenue</CardTitle>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold">{formatCurrency(stats?.totalRevenue ?? 0)}</div>
            <p className="text-[11px] text-muted-foreground mt-1">From {stats?.completedOrders ?? 0} completed orders</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/80 bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold">{stats?.totalOrders ?? 0}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              <span className="text-amber-500 font-semibold">{stats?.pendingOrders ?? 0} pending</span> · {stats?.readyOrders ?? 0} ready
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Quick Metrics Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-4">
        <Card className="p-3 sm:p-4 border-border/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary text-foreground">
              <Percent className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Total Discounts</p>
              <p className="text-base font-semibold">{formatCurrency(stats?.totalDiscounts ?? 0)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4 border-border/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary text-foreground">
              <Package className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Products in Catalog</p>
              <p className="text-base font-semibold">{stats?.totalProducts ?? 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4 border-border/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary text-foreground">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Registered Customers</p>
              <p className="text-base font-semibold">{stats?.totalCustomers ?? 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4 border-border/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary text-foreground">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Active Sellers</p>
              <p className="text-base font-semibold">{stats?.totalSellers ?? 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Performers & Highlights Banner */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/80 bg-gradient-to-br from-amber-500/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" /> Top Seller Performer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topSeller ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold">{topSeller.seller_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {topSeller.invoice_count} orders · Avg invoice {formatCurrency(topSeller.average_invoice)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                    {formatCurrency(topSeller.total_sales)}
                  </p>
                  <Badge variant="outline" className="text-[10px]">
                    Target {topSeller.target_progress}%
                  </Badge>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No seller sales recorded yet.</p>
            )}
            <div className="pt-2">
              <Link href="/admin/seller-performance">
                <Button variant="ghost" size="sm" className="w-full justify-between text-xs h-8">
                  <span>View All Seller Performance</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" /> Top Revenue Brand
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topBrand ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold">{topBrand.name}</p>
                  <p className="text-xs text-muted-foreground">{topBrand.orders} line item sales</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">{formatCurrency(topBrand.revenue)}</p>
                  <Badge variant="outline" className="text-[10px]">Brand Leader</Badge>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No brand sales recorded yet.</p>
            )}
            <div className="pt-2">
              <Link href="/admin/brand-analytics">
                <Button variant="ghost" size="sm" className="w-full justify-between text-xs h-8">
                  <span>View Full Brand Analytics</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 30-Day Sales Chart & Low Stock Alert Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sales Over Time Chart */}
        <Card className="lg:col-span-2 shadow-sm border-border/80">
          <CardHeader>
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" /> 30-Day Sales & Revenue Trend
            </CardTitle>
            <CardDescription>Daily revenue totals across all channels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full flex items-end gap-1.5 pt-6 pb-2 border-b border-border">
              {salesOverTime.map((d, i) => {
                const heightPct = Math.max(6, Math.round((d.revenue / maxRevenue) * 100));
                return (
                  <div key={i} className="flex-1 flex flex-col items-center group relative">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full bg-primary/80 group-hover:bg-primary rounded-t transition-all min-h-[4px]"
                    />
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
                      <div className="bg-popover text-popover-foreground text-[10px] p-2 rounded-lg shadow-xl border whitespace-nowrap">
                        <p className="font-semibold">{d.date}</p>
                        <p className="text-emerald-600 dark:text-emerald-400 font-bold">{formatCurrency(d.revenue)}</p>
                        <p className="text-[9px] text-muted-foreground">{d.orders} order(s)</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground mt-2 font-mono">
              <span>{salesOverTime[0]?.date || "30 days ago"}</span>
              <span>{salesOverTime[14]?.date || "15 days ago"}</span>
              <span>{salesOverTime[salesOverTime.length - 1]?.date || "Today"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts Box */}
        <Card className="shadow-sm border-border/80">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" /> Stock Level Alerts
            </CardTitle>
            <CardDescription>Items needing replenishment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!lowStockList.length ? (
              <div className="p-4 text-center text-xs text-muted-foreground bg-secondary/30 rounded-xl border">
                All catalog items are adequately stocked.
              </div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {lowStockList.slice(0, 6).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl border text-xs bg-card">
                    <div className="min-w-0 pr-2">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground">{item.brandName}</p>
                    </div>
                    <Badge variant={item.stockStatus === "sold_out" ? "destructive" : "warning"} className="text-[10px] shrink-0">
                      {item.stockStatus === "sold_out" ? "Out of Stock" : `${item.totalStock} left`}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            <Link href="/admin/inventory">
              <Button variant="outline" size="sm" className="w-full text-xs mt-2">
                Open Inventory Manager
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Overview */}
      <Card className="shadow-sm border-border/80">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-heading text-lg">Recent Orders</CardTitle>
            <CardDescription>Latest orders across POS and Website channels</CardDescription>
          </div>
          <Link href="/admin/orders">
            <Button variant="outline" size="sm" className="gap-1 text-xs">
              <span>All Orders</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {!recentOrders.length ? (
            <p className="text-xs text-muted-foreground">No recent orders.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Order #</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Source</th>
                    <th className="py-2.5 px-3">Total</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-3 font-semibold">#{o.id}</td>
                      <td className="py-3 px-3">
                        <p className="font-medium">{o.customerName}</p>
                        <p className="text-[10px] text-muted-foreground">{o.email || "—"}</p>
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant="outline" className="text-[10px] uppercase">{o.source}</Badge>
                      </td>
                      <td className="py-3 px-3 font-medium">{formatCurrency(o.totalPrice)}</td>
                      <td className="py-3 px-3">
                        <StatusBadge value={o.status} kind="order" />
                      </td>
                      <td className="py-3 px-3 text-[11px] text-muted-foreground">
                        {o.createdAt ? formatDateTime(o.createdAt) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
