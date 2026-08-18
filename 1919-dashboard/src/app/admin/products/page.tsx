"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Package, Plus, Search, Edit, Trash2, Tag, Layers, RefreshCw } from "lucide-react";
import { posApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { PosProduct, PosBrand, PosCategory } from "@/types/pos";
import { ErpPageHeader } from "@/components/erp/page-header";
import { ErpToolbar } from "@/components/erp/toolbar";
import { ErpTable, ErpTd, ErpTh } from "@/components/erp/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductFormDialog } from "@/components/manage/ProductFormDialog";

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const productsQuery = useQuery({ queryKey: ["admin-products"], queryFn: posApi.products });
  const brandsQuery = useQuery({ queryKey: ["admin-brands"], queryFn: () => posApi.brands({ all: true }) });
  const categoriesQuery = useQuery({ queryKey: ["admin-categories"], queryFn: posApi.categories });

  const [query, setQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<PosProduct | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const products = productsQuery.data ?? [];
  const brands = brandsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  const filteredProducts = products.filter((p) => {
    const q = query.trim().toLowerCase();
    const matchQuery =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.barcode?.toLowerCase().includes(q) ||
      p.brandName?.toLowerCase().includes(q);
    const matchBrand =
      selectedBrand === "all" || String(p.brandId ?? p.brand_id) === selectedBrand;
    return matchQuery && matchBrand;
  });

  const handleDelete = async (p: PosProduct) => {
    if (!confirm(`Delete product "${p.name}"? This action cannot be undone.`)) return;
    try {
      await posApi.deleteProduct(p.id);
      toast.success(`Product "${p.name}" deleted`);
      await productsQuery.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleSaveProduct = async (values: any) => {
    setSubmitting(true);
    try {
      const { buildProductFormData } = await import("@/components/manage/ProductFormDialog");
      const formData = buildProductFormData(values);
      if (editingProduct) {
        await posApi.updateProduct(editingProduct.id, formData);
        toast.success("Product updated successfully");
      } else {
        await posApi.createProduct(formData);
        toast.success("Product created successfully");
      }
      await productsQuery.refetch();
      setShowAddDialog(false);
      setEditingProduct(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <ErpPageHeader
          eyebrow="Catalog Management"
          title="Products Catalog"
          description="Manage products, brand assignments, prices, barcodes, variants, and stock."
        />
        <Button onClick={() => setShowAddDialog(true)} className="gap-2 self-start sm:self-auto">
          <Plus className="h-4 w-4" /> Create New Product
        </Button>
      </div>

      <ErpToolbar
        search={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search product name, barcode, or brand…"
        onRefresh={() => void productsQuery.refetch()}
        refreshing={productsQuery.isFetching}
        filters={
          <select
            className="h-10 rounded-xl border bg-background px-3 text-sm"
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
          >
            <option value="all">All Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={String(b.id)}>{b.name}</option>
            ))}
          </select>
        }
      />

      <ErpTable>
        <thead>
          <tr>
            <ErpTh>Product</ErpTh>
            <ErpTh>Brand</ErpTh>
            <ErpTh>Barcode</ErpTh>
            <ErpTh>Variants / Sizes</ErpTh>
            <ErpTh>Price Range</ErpTh>
            <ErpTh>Total Stock</ErpTh>
            <ErpTh className="text-right">Actions</ErpTh>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((p) => {
            const prices = p.variants.map((v) => v.price);
            const minPrice = prices.length ? Math.min(...prices) : 0;
            const maxPrice = prices.length ? Math.max(...prices) : 0;
            const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);

            return (
              <tr key={p.id} className="hover:bg-secondary/40">
                <ErpTd className="font-medium">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.coverImage || "/uploads/brand-logo.png"}
                      alt={p.name}
                      className="h-10 w-10 object-cover rounded-lg border bg-secondary"
                    />
                    <div>
                      <p className="font-semibold text-sm">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground">ID: #{p.id}</p>
                    </div>
                  </div>
                </ErpTd>
                <ErpTd>
                  <Badge variant="outline" className="font-semibold gap-1">
                    <Tag className="h-3 w-3 text-primary" /> {p.brandName || "1990"}
                  </Badge>
                </ErpTd>
                <ErpTd className="font-mono text-xs font-bold text-foreground">
                  {p.barcode || "—"}
                </ErpTd>
                <ErpTd>
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {p.variants.map((v, idx) => (
                      <span key={idx} className="text-[10px] bg-secondary px-2 py-0.5 rounded font-mono">
                        {v.label}: {v.stock}
                      </span>
                    ))}
                  </div>
                </ErpTd>
                <ErpTd className="font-bold text-foreground">
                  {minPrice === maxPrice ? formatCurrency(minPrice) : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`}
                </ErpTd>
                <ErpTd>
                  <Badge variant={totalStock <= 0 ? "destructive" : totalStock <= 5 ? "warning" : "success"}>
                    {totalStock} in stock
                  </Badge>
                </ErpTd>
                <ErpTd>
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="outline" onClick={() => setEditingProduct(p)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => void handleDelete(p)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </ErpTd>
              </tr>
            );
          })}
        </tbody>
      </ErpTable>

      {/* Product Form Dialog */}
      {(showAddDialog || editingProduct) && (
        <ProductFormDialog
          open={showAddDialog || !!editingProduct}
          onOpenChange={(open) => {
            if (!open) {
              setShowAddDialog(false);
              setEditingProduct(null);
            }
          }}
          product={editingProduct}
          brands={brands}
          categories={categories}
          onSubmit={handleSaveProduct}
          submitting={submitting}
        />
      )}
    </div>
  );
}
