import { useState } from "react";
import { Package, AlertTriangle, Ban } from "lucide-react";
import { toast } from "sonner";
import { inventoryService } from "@/services/inventory";
import { categoryService } from "@/services/categories";
import { useAsyncData } from "@/hooks/useAsyncData";
import type { InventoryItem } from "@/types/inventory";
import type { ProductVariant } from "@/types/product";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function stockBadge(status: InventoryItem["stockStatus"]) {
  switch (status) {
    case "sold_out":
      return (
        <Badge variant="destructive" className="gap-1">
          <Ban className="h-3 w-3" />
          Sold Out
        </Badge>
      );
    case "low_stock":
      return (
        <Badge variant="outline" className="gap-1 border-amber-500 text-amber-600">
          <AlertTriangle className="h-3 w-3" />
          Low Stock
        </Badge>
      );
    default:
      return <Badge variant="secondary">In Stock</Badge>;
  }
}

export function InventoryPage() {
  const { data: inventory, loading, error, refetch } = useAsyncData(
    inventoryService.getAll
  );
  const { data: categories } = useAsyncData(categoryService.getAll);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftVariants, setDraftVariants] = useState<ProductVariant[]>([]);
  const [draftThreshold, setDraftThreshold] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const getCategoryName = (id: number | null) =>
    categories?.find((c) => c.id === id)?.name ?? "—";

  const startEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setDraftVariants(item.variants.map((v) => ({ ...v })));
    setDraftThreshold(item.lowStockThreshold);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftVariants([]);
  };

  const updateVariantStock = (index: number, stock: number) => {
    setDraftVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, stock } : v))
    );
  };

  const handleSave = async (productId: number) => {
    setSubmitting(true);
    try {
      await inventoryService.updateStock(productId, draftVariants, draftThreshold);
      toast.success("Inventory updated");
      setEditingId(null);
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update inventory");
    } finally {
      setSubmitting(false);
    }
  };

  const lowStockCount = inventory?.filter((i) => i.stockStatus === "low_stock").length ?? 0;
  const soldOutCount = inventory?.filter((i) => i.stockStatus === "sold_out").length ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Track stock levels, low stock warnings, and sold-out products."
      />

      {!loading && inventory && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Package className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{inventory.length}</p>
                <p className="text-xs text-muted-foreground">Total Products</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">{lowStockCount}</p>
                <p className="text-xs text-muted-foreground">Low Stock</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Ban className="h-8 w-8 text-destructive" />
              <div>
                <p className="text-2xl font-bold">{soldOutCount}</p>
                <p className="text-xs text-muted-foreground">Sold Out</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {loading && (
        <Card>
          <CardContent className="p-0">
            <LoadingState rows={6} />
          </CardContent>
        </Card>
      )}

      {error && <ErrorState message={error} onRetry={refetch} />}

      {!loading && !error && inventory?.length === 0 && (
        <EmptyState
          icon={Package}
          title="No products"
          description="Add products first to manage inventory."
        />
      )}

      {!loading && !error && inventory && inventory.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Variants & Stock</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => {
                  const isEditing = editingId === item.id;
                  const variants = isEditing ? draftVariants : item.variants;

                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {item.coverImage ? (
                            <img
                              src={item.coverImage}
                              alt={item.name}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                              <Package className="h-4 w-4" />
                            </div>
                          )}
                          <p className="font-medium">{item.name}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getCategoryName(item.categoryId)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {variants.map((v, idx) => (
                            <div key={v.label} className="flex items-center gap-2 text-sm">
                              <span className="min-w-16 font-mono text-xs">{v.label}</span>
                              {isEditing ? (
                                <Input
                                  type="number"
                                  min={0}
                                  className="h-7 w-20"
                                  value={v.stock}
                                  onChange={(e) =>
                                    updateVariantStock(idx, Number(e.target.value))
                                  }
                                />
                              ) : (
                                <span className="text-muted-foreground">{v.stock} units</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {variants.reduce((s, v) => s + v.stock, 0)}
                      </TableCell>
                      <TableCell>{stockBadge(item.stockStatus)}</TableCell>
                      <TableCell className="text-right">
                        {isEditing ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={cancelEdit}
                              disabled={submitting}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleSave(item.id)}
                              disabled={submitting}
                            >
                              Save
                            </Button>
                          </div>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => startEdit(item)}>
                            Edit Stock
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
