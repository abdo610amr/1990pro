"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ClipboardList,
  Eye,
  Printer,
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  PackageCheck,
  AlertCircle,
} from "lucide-react";
import { posApi } from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { PosOrder } from "@/types/pos";
import { ErpPageHeader } from "@/components/erp/page-header";
import { ErpToolbar } from "@/components/erp/toolbar";
import { ErpTable, ErpTd, ErpTh } from "@/components/erp/data-table";
import { StatusBadge } from "@/components/erp/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type StatusTab = "pending" | "preparing" | "ready" | "completed" | "cancelled" | "returned" | "all";

export default function AdminOrdersPage() {
  const { data: orders = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: posApi.orders,
  });

  const [tab, setTab] = useState<StatusTab>("pending");
  const [source, setSource] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<PosOrder | null>(null);

  const statusCounts = useMemo(() => {
    const acc: Record<string, number> = { all: orders.length };
    orders.forEach((o) => {
      const st = (o.status || "pending").toLowerCase();
      acc[st] = (acc[st] ?? 0) + 1;
    });
    return acc;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const st = (o.status || "pending").toLowerCase();
      const matchTab = tab === "all" || st === tab;
      const matchSource = source === "all" || (o.source || "website") === source;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        String(o.id).includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.email?.toLowerCase().includes(q) ||
        o.phone?.includes(q);
      return matchTab && matchSource && matchSearch;
    });
  }, [orders, tab, source, search]);

  const handleUpdateStatus = async (orderId: number, nextStatus: string) => {
    try {
      await posApi.updateOrderStatus(orderId, nextStatus);
      toast.success(`Order #${orderId} status changed to ${nextStatus}`);
      await refetch();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: nextStatus } : null));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Status update failed");
    }
  };

  const handlePrint = (o: PosOrder) => {
    const printWin = window.open("", "_blank");
    if (!printWin) return;
    printWin.document.write(`
      <html>
        <head>
          <title>Order Receipt #${o.id}</title>
          <style>
            body { font-family: monospace; padding: 20px; max-width: 400px; margin: 0 auto; }
            h2 { text-align: center; margin-bottom: 5px; }
            .meta { font-size: 12px; margin-bottom: 15px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { text-align: left; padding: 4px 0; }
            .total { font-weight: bold; font-size: 14px; border-top: 1px dashed #000; margin-top: 10px; pt: 5px; }
          </style>
        </head>
        <body>
          <h2>1990 STORE RECEIPT</h2>
          <div class="meta">
            <p>Order #: ${o.id}</p>
            <p>Customer: ${o.customerName || "Walk-in Customer"}</p>
            <p>Date: ${new Date(o.createdAt || Date.now()).toLocaleString()}</p>
            <p>Status: ${o.status.toUpperCase()}</p>
          </div>
          <table>
            <thead>
              <tr><th>Item</th><th>Brand/Barcode</th><th>Qty</th><th>Price</th></tr>
            </thead>
            <tbody>
              ${(o.items || []).map((i) => `
                <tr>
                  <td>${i.name} (${i.variant || "Std"})</td>
                  <td>[${i.brand_name || i.brandName || "1990"}] ${i.barcode || "—"}</td>
                  <td>${i.quantity}</td>
                  <td>$${i.price * i.quantity}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <div class="total">
            <p>TOTAL: $${o.totalPrice}</p>
          </div>
          <script>window.print(); setTimeout(() => window.close(), 1000);</script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  return (
    <div className="space-y-6">
      <ErpPageHeader
        eyebrow="Fulfillment & Dispatch"
        title="Orders Workflow & Management"
        description="Monitor online & in-store orders, inspect brand line items, print receipts, and advance fulfillment statuses."
      />

      {/* Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        {(["pending", "preparing", "ready", "completed", "cancelled", "returned", "all"] as StatusTab[]).map((st) => (
          <button
            key={st}
            onClick={() => setTab(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
              tab === st
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-background text-muted-foreground hover:bg-secondary border-border/80"
            }`}
          >
            {st} <span className="ml-1 opacity-70">({statusCounts[st] ?? 0})</span>
          </button>
        ))}
      </div>

      <ErpToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search order #, customer name, email, or phone…"
        onRefresh={() => void refetch()}
        refreshing={isFetching}
        filters={
          <select
            className="h-10 rounded-xl border bg-background px-3 text-sm"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          >
            <option value="all">All Sources</option>
            <option value="website">Website Orders</option>
            <option value="pos">POS Store Sales</option>
          </select>
        }
      />

      <ErpTable>
        <thead>
          <tr>
            <ErpTh>Order #</ErpTh>
            <ErpTh>Customer</ErpTh>
            <ErpTh>Source</ErpTh>
            <ErpTh>Items</ErpTh>
            <ErpTh>Total</ErpTh>
            <ErpTh>Status</ErpTh>
            <ErpTh>Date</ErpTh>
            <ErpTh className="text-right">Actions</ErpTh>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((o) => (
            <tr key={o.id} className="hover:bg-secondary/40">
              <ErpTd className="font-bold">#{o.id}</ErpTd>
              <ErpTd>
                <p className="font-semibold text-sm">{o.customerName || "Walk-in Customer"}</p>
                <p className="text-[10px] text-muted-foreground">{o.email || o.phone || "No contact info"}</p>
              </ErpTd>
              <ErpTd>
                <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                  {o.source || "website"}
                </Badge>
              </ErpTd>
              <ErpTd>{(o.items || []).length} item(s)</ErpTd>
              <ErpTd className="font-bold text-foreground">{formatCurrency(o.totalPrice)}</ErpTd>
              <ErpTd>
                <StatusBadge value={o.status || "pending"} kind="order" />
              </ErpTd>
              <ErpTd className="text-xs text-muted-foreground">{formatDateTime(o.createdAt)}</ErpTd>
              <ErpTd>
                <div className="flex justify-end gap-1">
                  <Button size="sm" variant="outline" onClick={() => setSelectedOrder(o)}>
                    <Eye className="h-3.5 w-3.5" /> Details
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handlePrint(o)}>
                    <Printer className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </ErpTd>
            </tr>
          ))}
        </tbody>
      </ErpTable>

      {/* Order Details Dialog */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50">
          <Card className="w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h2 className="font-heading text-2xl font-bold">Order #{selectedOrder.id}</h2>
                  <p className="text-xs text-muted-foreground">
                    Placed on {formatDateTime(selectedOrder.createdAt)} via {selectedOrder.source?.toUpperCase() || "WEBSITE"}
                  </p>
                </div>
                <StatusBadge value={selectedOrder.status} kind="order" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs bg-secondary/30 p-3.5 rounded-xl border">
                <div>
                  <p className="font-semibold text-muted-foreground uppercase text-[10px]">Customer</p>
                  <p className="font-bold text-sm text-foreground">{selectedOrder.customerName || "Walk-in"}</p>
                  <p>{selectedOrder.email || "No email"}</p>
                  <p>{selectedOrder.phone || "No phone"}</p>
                </div>
                <div>
                  <p className="font-semibold text-muted-foreground uppercase text-[10px]">Delivery Address</p>
                  <p className="font-medium text-foreground">{selectedOrder.address || "In-store pickup"}</p>
                  <p className="mt-1 font-semibold text-muted-foreground uppercase text-[10px]">Payment Method</p>
                  <p className="font-medium uppercase">{selectedOrder.payment_method || "Cash"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Line Items & Brand Details</p>
                <div className="space-y-2 border rounded-xl p-3 bg-card">
                  {(selectedOrder.items || []).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0 text-xs">
                      <div className="flex items-center gap-3">
                        {item.brand_logo && (
                          <img src={item.brand_logo} alt="brand" className="h-8 w-8 object-contain rounded border p-0.5" />
                        )}
                        <div>
                          <p className="font-bold text-sm">{item.name}</p>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            <span className="font-semibold text-primary">[{item.brand_name || item.brandName || "1990"}]</span>
                            <span>Barcode: {item.barcode || "—"}</span>
                            <span>Variant: {item.variant || item.size || "Standard"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <p className="font-bold">{formatCurrency(item.price * item.quantity)}</p>
                        <p className="text-[10px] text-muted-foreground">{item.quantity} × {formatCurrency(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center bg-secondary/50 p-3 rounded-xl border text-sm font-bold">
                <span>Total Amount</span>
                <span className="text-lg text-primary">{formatCurrency(selectedOrder.totalPrice)}</span>
              </div>

              {/* Status Action Workflow Buttons */}
              <div className="space-y-2 pt-2 border-t">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Update Fulfillment Status</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={selectedOrder.status === "preparing" ? "default" : "outline"}
                    onClick={() => void handleUpdateStatus(selectedOrder.id, "preparing")}
                  >
                    Mark Preparing
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedOrder.status === "ready" ? "default" : "outline"}
                    onClick={() => void handleUpdateStatus(selectedOrder.id, "ready")}
                  >
                    Mark Ready
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedOrder.status === "completed" ? "default" : "outline"}
                    onClick={() => void handleUpdateStatus(selectedOrder.id, "completed")}
                  >
                    Mark Completed
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => void handleUpdateStatus(selectedOrder.id, "cancelled")}
                  >
                    Cancel Order
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                  Close
                </Button>
                <Button onClick={() => handlePrint(selectedOrder)} className="gap-2">
                  <Printer className="h-4 w-4" /> Print Receipt
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
