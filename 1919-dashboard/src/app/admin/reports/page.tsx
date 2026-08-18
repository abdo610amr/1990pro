"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Download, Filter, FileSpreadsheet, Building2, User, Package } from "lucide-react";
import { posApi } from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ErpPageHeader } from "@/components/erp/page-header";
import { ErpTable, ErpTd, ErpTh } from "@/components/erp/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type ReportType = "sales" | "orders" | "sellers" | "brands" | "products" | "inventory";

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("sales");
  const [selectedBrand, setSelectedBrand] = useState("all");

  const { data: stats } = useQuery({ queryKey: ["admin-stats-reports"], queryFn: posApi.stats });
  const { data: orders = [] } = useQuery({ queryKey: ["admin-orders-reports"], queryFn: posApi.orders });
  const { data: sellers = [] } = useQuery({ queryKey: ["admin-sellers-reports"], queryFn: posApi.sellerPerformance });
  const { data: brandReports = [] } = useQuery({ queryKey: ["admin-brand-reports"], queryFn: posApi.brandReports });
  const { data: inventory = [] } = useQuery({ queryKey: ["admin-inventory-reports"], queryFn: posApi.inventory });

  const exportCSV = () => {
    let filename = `1990-pos-${reportType}-report.csv`;
    let rows: string[][] = [];

    if (reportType === "sales" || reportType === "orders") {
      rows = [
        ["Order ID", "Customer", "Source", "Total Price ($)", "Status", "Date"],
        ...orders.map((o) => [
          String(o.id),
          o.customerName || "Customer",
          o.source || "website",
          String(o.totalPrice),
          o.status,
          String(o.createdAt),
        ]),
      ];
    } else if (reportType === "sellers") {
      rows = [
        ["Rank", "Seller Name", "Total Sales ($)", "Invoice Count", "Avg Invoice ($)", "Discount ($)", "Target Progress (%)"],
        ...sellers.map((s) => [
          String(s.rank),
          s.seller_name,
          String(s.total_sales),
          String(s.invoice_count),
          String(s.average_invoice),
          String(s.total_discount),
          String(s.target_progress),
        ]),
      ];
    } else if (reportType === "brands") {
      rows = [
        ["Brand ID", "Brand Name", "Units Sold", "Total Orders", "Total Revenue ($)", "Commission (%)", "Commission ($)"],
        ...brandReports.map((b) => [
          String(b.brand_id),
          b.brand_name,
          String(b.units_sold),
          String(b.total_orders),
          String(b.total_revenue),
          String(b.commission_percentage),
          String(b.commission_amount),
        ]),
      ];
    } else if (reportType === "inventory") {
      rows = [
        ["Product ID", "Product Name", "Total Stock", "Threshold", "Status"],
        ...inventory.map((i) => [
          String(i.id),
          i.name,
          String(i.totalStock),
          String(i.lowStockThreshold),
          i.stockStatus,
        ]),
      ];
    }

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.map((cell) => `"${cell}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <ErpPageHeader
          eyebrow="Business Intelligence"
          title="Reports & Financial Exports"
          description="Generate detailed sales, seller performance, brand commission, and inventory reports."
        />
        <Button onClick={exportCSV} className="gap-2 self-start sm:self-auto">
          <Download className="h-4 w-4" /> Export CSV Report
        </Button>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-3">
        {[
          { key: "sales", label: "Sales & Revenue Report" },
          { key: "orders", label: "Orders Report" },
          { key: "sellers", label: "Seller Performance Report" },
          { key: "brands", label: "Brand Commission Report" },
          { key: "inventory", label: "Inventory Audit Report" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setReportType(t.key as ReportType)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all border ${
              reportType === t.key
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-background text-muted-foreground hover:bg-secondary border-border/80"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Active Report Table Render */}
      {reportType === "sales" || reportType === "orders" ? (
        <ErpTable>
          <thead>
            <tr>
              <ErpTh>Order #</ErpTh>
              <ErpTh>Customer</ErpTh>
              <ErpTh>Source</ErpTh>
              <ErpTh>Total Price</ErpTh>
              <ErpTh>Status</ErpTh>
              <ErpTh>Date</ErpTh>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-secondary/40">
                <ErpTd className="font-bold">#{o.id}</ErpTd>
                <ErpTd>{o.customerName || "Customer"}</ErpTd>
                <ErpTd>
                  <Badge variant="outline" className="text-[10px] uppercase">{o.source || "website"}</Badge>
                </ErpTd>
                <ErpTd className="font-bold text-foreground">{formatCurrency(o.totalPrice)}</ErpTd>
                <ErpTd>
                  <Badge variant={o.status === "completed" ? "success" : o.status === "cancelled" ? "destructive" : "warning"}>
                    {o.status}
                  </Badge>
                </ErpTd>
                <ErpTd className="text-xs text-muted-foreground">{formatDateTime(o.createdAt)}</ErpTd>
              </tr>
            ))}
          </tbody>
        </ErpTable>
      ) : reportType === "sellers" ? (
        <ErpTable>
          <thead>
            <tr>
              <ErpTh>Rank</ErpTh>
              <ErpTh>Seller Name</ErpTh>
              <ErpTh>Total Sales</ErpTh>
              <ErpTh>Orders</ErpTh>
              <ErpTh>Avg Invoice</ErpTh>
              <ErpTh>Discounts</ErpTh>
              <ErpTh>Target Progress</ErpTh>
            </tr>
          </thead>
          <tbody>
            {sellers.map((s) => (
              <tr key={s.seller_id} className="hover:bg-secondary/40">
                <ErpTd className="font-bold">#{s.rank}</ErpTd>
                <ErpTd className="font-semibold">{s.seller_name}</ErpTd>
                <ErpTd className="font-bold text-primary">{formatCurrency(s.total_sales)}</ErpTd>
                <ErpTd>{s.invoice_count}</ErpTd>
                <ErpTd>{formatCurrency(s.average_invoice)}</ErpTd>
                <ErpTd>{formatCurrency(s.total_discount)}</ErpTd>
                <ErpTd className="font-semibold text-emerald-600 dark:text-emerald-400">{s.target_progress}%</ErpTd>
              </tr>
            ))}
          </tbody>
        </ErpTable>
      ) : reportType === "brands" ? (
        <ErpTable>
          <thead>
            <tr>
              <ErpTh>Brand</ErpTh>
              <ErpTh>Units Sold</ErpTh>
              <ErpTh>Total Orders</ErpTh>
              <ErpTh>Total Revenue</ErpTh>
              <ErpTh>Commission Rate</ErpTh>
              <ErpTh>Commission Amount</ErpTh>
            </tr>
          </thead>
          <tbody>
            {brandReports.map((b) => (
              <tr key={b.brand_id} className="hover:bg-secondary/40">
                <ErpTd className="font-bold">{b.brand_name}</ErpTd>
                <ErpTd>{b.units_sold}</ErpTd>
                <ErpTd>{b.total_orders}</ErpTd>
                <ErpTd className="font-bold text-foreground">{formatCurrency(b.total_revenue)}</ErpTd>
                <ErpTd className="font-mono">{b.commission_percentage}%</ErpTd>
                <ErpTd className="font-bold text-amber-600 dark:text-amber-400">{formatCurrency(b.commission_amount)}</ErpTd>
              </tr>
            ))}
          </tbody>
        </ErpTable>
      ) : (
        <ErpTable>
          <thead>
            <tr>
              <ErpTh>Product Name</ErpTh>
              <ErpTh>Total Stock</ErpTh>
              <ErpTh>Alert Threshold</ErpTh>
              <ErpTh>Stock Status</ErpTh>
            </tr>
          </thead>
          <tbody>
            {inventory.map((i) => (
              <tr key={i.id} className="hover:bg-secondary/40">
                <ErpTd className="font-semibold">{i.name}</ErpTd>
                <ErpTd className="font-bold">{i.totalStock}</ErpTd>
                <ErpTd className="font-mono text-xs">{i.lowStockThreshold} units</ErpTd>
                <ErpTd>
                  <Badge variant={i.stockStatus === "sold_out" ? "destructive" : i.stockStatus === "low_stock" ? "warning" : "success"}>
                    {i.stockStatus}
                  </Badge>
                </ErpTd>
              </tr>
            ))}
          </tbody>
        </ErpTable>
      )}
    </div>
  );
}
