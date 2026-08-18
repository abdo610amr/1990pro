"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Warehouse, AlertTriangle, CheckCircle2, Search, Edit } from "lucide-react";
import { posApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ErpPageHeader } from "@/components/erp/page-header";
import { ErpToolbar } from "@/components/erp/toolbar";
import { ErpTable, ErpTd, ErpTh } from "@/components/erp/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminInventoryPage() {
  const { data: inventory = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin-inventory"],
    queryFn: posApi.inventory,
  });

  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingItem, setEditingItem] = useState<(typeof inventory)[number] | null>(null);
  const [variants, setVariants] = useState<{ label: string; price: number; stock: number; sku?: string }[]>([]);
  const [lowStockThreshold, setLowStockThreshold] = useState("5");
  const [busy, setBusy] = useState(false);

  const filtered = inventory.filter((item) => {
    const q = query.trim().toLowerCase();
    const matchQuery = !q || item.name.toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || item.stockStatus === filterStatus;
    return matchQuery && matchStatus;
  });

  const startEdit = (item: (typeof inventory)[number]) => {
    setEditingItem(item);
    setVariants(item.variants.map((v) => ({ ...v })));
    setLowStockThreshold(String(item.lowStockThreshold ?? 5));
  };

  const handleSaveInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setBusy(true);
    try {
      await posApi.updateInventory(
        editingItem.id,
        variants,
        Number(lowStockThreshold) || 5
      );
      toast.success(`Inventory updated for "${editingItem.name}"`);
      setEditingItem(null);
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Inventory update failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <ErpPageHeader
        eyebrow="Stock Control"
        title="Inventory Control & Replenishment"
        description="Monitor product stock levels across variants, receive low stock alerts, and adjust inventory."
      />

      <ErpToolbar
        search={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search product inventory by name…"
        onRefresh={() => void refetch()}
        refreshing={isFetching}
        filters={
          <select
            className="h-10 rounded-xl border bg-background px-3 text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Stock Statuses</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock Alerts</option>
            <option value="sold_out">Sold Out / Out of Stock</option>
          </select>
        }
      />

      <ErpTable>
        <thead>
          <tr>
            <ErpTh>Product</ErpTh>
            <ErpTh>Variants Breakdown</ErpTh>
            <ErpTh>Total Stock</ErpTh>
            <ErpTh>Alert Threshold</ErpTh>
            <ErpTh>Stock Status</ErpTh>
            <ErpTh className="text-right">Actions</ErpTh>
          </tr>
        </thead>
        <tbody>
          {filtered.map((item) => (
            <tr key={item.id} className="hover:bg-secondary/40">
              <ErpTd className="font-medium">
                <div className="flex items-center gap-3">
                  <img src={item.coverImage} alt={item.name} className="h-10 w-10 object-cover rounded-lg border bg-secondary" />
                  <div>
                    <p className="font-semibold text-sm">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">ID: #{item.id}</p>
                  </div>
                </div>
              </ErpTd>
              <ErpTd>
                <div className="flex flex-wrap gap-1 max-w-[300px]">
                  {item.variants.map((v, idx) => (
                    <span key={idx} className="text-[11px] bg-secondary border px-2 py-0.5 rounded font-mono">
                      {v.label}: <strong>{v.stock}</strong> ({formatCurrency(v.price)})
                    </span>
                  ))}
                </div>
              </ErpTd>
              <ErpTd className="font-bold text-foreground">{item.totalStock}</ErpTd>
              <ErpTd className="font-mono text-xs">{item.lowStockThreshold} units</ErpTd>
              <ErpTd>
                <Badge variant={item.stockStatus === "sold_out" ? "destructive" : item.stockStatus === "low_stock" ? "warning" : "success"}>
                  {item.stockStatus === "sold_out" ? "Sold Out" : item.stockStatus === "low_stock" ? "Low Stock" : "In Stock"}
                </Badge>
              </ErpTd>
              <ErpTd>
                <div className="flex justify-end">
                  <Button size="sm" variant="outline" onClick={() => startEdit(item)} className="gap-1">
                    <Edit className="h-3.5 w-3.5" /> Adjust Stock
                  </Button>
                </div>
              </ErpTd>
            </tr>
          ))}
        </tbody>
      </ErpTable>

      {/* Adjust Stock Dialog */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50">
          <Card className="w-full max-w-lg shadow-2xl">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-heading text-2xl">Adjust Stock & Threshold</h2>
              <p className="text-xs text-muted-foreground">{editingItem.name}</p>

              <form onSubmit={handleSaveInventory} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Low Stock Alert Threshold</label>
                  <Input type="number" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} min={1} />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold">Variants Stock Levels</label>
                  {variants.map((v, idx) => (
                    <div key={idx} className="flex items-center gap-2 border p-2 rounded-xl bg-secondary/20">
                      <span className="text-xs font-bold w-16 truncate">{v.label}</span>
                      <Input
                        type="number"
                        placeholder="Price"
                        value={v.price}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setVariants((prev) => prev.map((item, i) => i === idx ? { ...item, price: val } : item));
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Stock"
                        value={v.stock}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setVariants((prev) => prev.map((item, i) => i === idx ? { ...item, stock: val } : item));
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={busy}>
                    {busy ? "Saving…" : "Save Inventory"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
