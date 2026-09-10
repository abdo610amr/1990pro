"use client";

import { useQuery } from "@tanstack/react-query";
import { LineChart, Building2, DollarSign, Award, Percent, ShoppingBag, Package } from "lucide-react";
import { posApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ErpPageHeader } from "@/components/erp/page-header";
import { ErpTable, ErpTd, ErpTh } from "@/components/erp/data-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminBrandAnalyticsPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["admin-brand-analytics"],
    queryFn: posApi.brandAnalytics,
  });

  const summary = analytics?.summary;
  const brands = (analytics?.brands ?? []) as any[];
  const topSelling = (analytics?.top_selling_brands ?? []) as any[];

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">Loading brand analytics…</div>;
  }

  const topBrandItem = topSelling[0] as { brand_name?: string; total_revenue?: number } | undefined;

  return (
    <div className="space-y-6">
      <ErpPageHeader
        eyebrow="Supplier & Consignment Insights"
        title="Brand Analytics & Commission Tracking"
        description="Comprehensive brand revenue share, sales volume, commission fee calculations, and product statistics."
      />

      {/* Summary KPI Grid */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="shadow-sm border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Active Brands</CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{summary?.active_brands ?? 0} / {summary?.total_brands ?? 0}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Supplier brand entities</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Brand Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(summary?.total_revenue ?? 0)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Completed brand sales</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Platform Commission</CardTitle>
            <Percent className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {formatCurrency(summary?.total_commission ?? 0)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Calculated commission fees</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Top Performing Brand</CardTitle>
            <Award className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-lg font-bold truncate">{topBrandItem?.brand_name || "—"}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {topBrandItem ? formatCurrency(topBrandItem.total_revenue ?? 0) : "No sales"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Brand Performance Table */}
      <ErpTable>
        <thead>
          <tr>
            <ErpTh>Brand</ErpTh>
            <ErpTh>Prefix</ErpTh>
            <ErpTh>Products</ErpTh>
            <ErpTh>Items Sold</ErpTh>
            <ErpTh>Orders</ErpTh>
            <ErpTh>Total Revenue</ErpTh>
            <ErpTh>Commission Rate</ErpTh>
            <ErpTh>Commission Amount</ErpTh>
          </tr>
        </thead>
        <tbody>
          {brands.map((b) => (
            <tr key={b.brand_id} className="hover:bg-secondary/40">
              <ErpTd className="font-semibold">
                <div className="flex items-center gap-3">
                  <img src={b.logo} alt={b.brand_name} className="h-8 w-8 object-contain rounded border p-0.5" />
                  <span>{b.brand_name}</span>
                </div>
              </ErpTd>
              <ErpTd className="font-mono text-xs font-bold text-primary">{b.barcodePrefix}</ErpTd>
              <ErpTd>{b.product_count}</ErpTd>
              <ErpTd>{b.items_sold}</ErpTd>
              <ErpTd>{b.order_count}</ErpTd>
              <ErpTd className="font-bold text-foreground">{formatCurrency(b.total_revenue)}</ErpTd>
              <ErpTd className="font-mono">{b.commissionPercentage}%</ErpTd>
              <ErpTd className="font-bold text-amber-600 dark:text-amber-400">{formatCurrency(b.commission_amount)}</ErpTd>
            </tr>
          ))}
        </tbody>
      </ErpTable>
    </div>
  );
}
