"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Award, TrendingUp, DollarSign, Calendar, Filter, Users } from "lucide-react";
import { posApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { SellerPerformance } from "@/types/pos";
import { ErpPageHeader } from "@/components/erp/page-header";
import { ErpTable, ErpTd, ErpTh } from "@/components/erp/data-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DATE_RANGE_OPTIONS = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "all", label: "All Time" },
] as const;

type DateRangeKey = (typeof DATE_RANGE_OPTIONS)[number]["key"];

export default function AdminSellerPerformancePage() {
  const { data: sellers = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin-seller-performance"],
    queryFn: posApi.sellerPerformance,
  });

  const [dateFilter, setDateFilter] = useState<DateRangeKey>("month");

  const topSeller = sellers.length ? sellers[0] : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <ErpPageHeader
          eyebrow="Staff Analytics"
          title="Seller Performance & Rankings"
          description="Track sales velocity, invoice averages, targets, and brand breakdowns per salesperson."
        />
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {DATE_RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setDateFilter(opt.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                dateFilter === opt.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground hover:bg-secondary"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Performer Showcase Card */}
      {topSeller && (
        <Card className="border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-card to-card shadow-lg">
          <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-black font-heading text-2xl font-bold">
                #1
              </div>
              <div>
                <Badge className="bg-amber-400 text-black border-0 text-[10px] uppercase font-bold mb-1">
                  Top Ranking Seller
                </Badge>
                <h3 className="font-heading text-2xl font-bold">{topSeller.seller_name}</h3>
                <p className="text-xs text-muted-foreground">
                  {topSeller.invoice_count} orders · Avg invoice {formatCurrency(topSeller.average_invoice)}
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs text-muted-foreground">Total Sales</p>
              <p className="font-heading text-3xl font-bold text-amber-600 dark:text-amber-400">
                {formatCurrency(topSeller.total_sales)}
              </p>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                Target Progress: {topSeller.target_progress}%
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seller Performance Grid Table */}
      <ErpTable>
        <thead>
          <tr>
            <ErpTh>Rank</ErpTh>
            <ErpTh>Seller Name</ErpTh>
            <ErpTh>Status</ErpTh>
            <ErpTh>Total Sales</ErpTh>
            <ErpTh>Orders</ErpTh>
            <ErpTh>Avg Invoice</ErpTh>
            <ErpTh>Discounts</ErpTh>
            <ErpTh>Today's Sales</ErpTh>
            <ErpTh>Monthly Sales</ErpTh>
            <ErpTh>Target Progress</ErpTh>
          </tr>
        </thead>
        <tbody>
          {sellers.map((s) => (
            <tr key={s.seller_id} className="hover:bg-secondary/40">
              <ErpTd className="font-bold">
                <Badge variant={s.rank === 1 ? "default" : "outline"}>
                  #{s.rank}
                </Badge>
              </ErpTd>
              <ErpTd className="font-semibold">{s.seller_name}</ErpTd>
              <ErpTd>
                <Badge variant={s.status === "disabled" ? "destructive" : "success"} className="text-[10px] uppercase">
                  {s.status}
                </Badge>
              </ErpTd>
              <ErpTd className="font-bold text-primary">{formatCurrency(s.total_sales)}</ErpTd>
              <ErpTd>{s.invoice_count}</ErpTd>
              <ErpTd>{formatCurrency(s.average_invoice)}</ErpTd>
              <ErpTd>{formatCurrency(s.total_discount)}</ErpTd>
              <ErpTd>{formatCurrency(s.today_sales)}</ErpTd>
              <ErpTd>{formatCurrency(s.monthly_sales)}</ErpTd>
              <ErpTd>
                <div className="w-36 space-y-1">
                  <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                    <span>{formatCurrency(s.monthly_sales)}</span>
                    <span>{s.target_progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, s.target_progress)}%` }}
                    />
                  </div>
                </div>
              </ErpTd>
            </tr>
          ))}
        </tbody>
      </ErpTable>

      {/* Brand Breakdown per Seller */}
      <div className="space-y-4 pt-4">
        <h3 className="font-heading text-xl">Brand Sales Breakdown by Seller</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {sellers.map((s) => (
            <Card key={s.seller_id} className="border-border/80 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-heading text-lg">{s.seller_name}</CardTitle>
                  <Badge variant="outline">{s.brand_breakdown?.length || 0} Brands Sold</Badge>
                </div>
                <CardDescription>Brand sales composition</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {!s.brand_breakdown?.length ? (
                  <p className="text-xs text-muted-foreground">No brand sales recorded for this seller.</p>
                ) : (
                  <div className="space-y-1.5">
                    {s.brand_breakdown.map((b) => (
                      <div key={b.brand_id} className="flex items-center justify-between p-2 rounded-lg border text-xs bg-secondary/30">
                        <div className="flex items-center gap-2">
                          <img src={b.brand_logo} alt={b.brand_name} className="h-6 w-6 object-contain rounded border p-0.5" />
                          <span className="font-semibold">{b.brand_name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-foreground">{formatCurrency(b.revenue)}</span>
                          <span className="text-[10px] text-muted-foreground ml-2">({b.items_count} items)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
