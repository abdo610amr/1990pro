import { useState } from "react";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { toast } from "sonner";
import { productService } from "@/services/products";
import { useAsyncData } from "@/hooks/useAsyncData";
import type { Product, ProductFormData, ProductVariant } from "@/types/product";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProductFormDialog } from "@/components/products/ProductFormDialog";
import { formatCurrency } from "@/lib/utils";

export function ProductsPage() {
  const { data: products, loading, error, refetch } = useAsyncData(
    productService.getAll
  );
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (form: ProductFormData) => {
    setSubmitting(true);
    try {
      if (editingProduct) {
        await productService.update(editingProduct.id, form);
        toast.success("Product updated successfully");
      } else {
        await productService.create(form);
        toast.success("Product created successfully");
      }
      setFormOpen(false);
      setEditingProduct(null);
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSubmitting(true);
    try {
      await productService.remove(deleteId);
      toast.success("Product deleted");
      setDeleteId(null);
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setSubmitting(false);
    }
  };

  const openCreate = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const getMinPrice = (variants: ProductVariant[]) => {
    if (!variants.length) return "—";
    const min = Math.min(...variants.map((s) => Number(s.price)));
    return formatCurrency(min);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage your product catalog, images, sizes, and tags."
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        }
      />

      {loading && (
        <Card>
          <CardContent className="p-0">
            <LoadingState rows={6} />
          </CardContent>
        </Card>
      )}

      {error && <ErrorState message={error} onRetry={refetch} />}

      {!loading && !error && products?.length === 0 && (
        <EmptyState
          icon={Package}
          title="No products yet"
          description="Create your first product to start selling."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          }
        />
      )}

      {!loading && !error && products && products.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Variants</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.coverImage ? (
                          <img
                            src={product.coverImage}
                            alt={product.name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="line-clamp-1 max-w-xs text-xs text-muted-foreground">
                            {product.description}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.variants?.length ?? product.sizes?.length ?? 0}</TableCell>
                    <TableCell>{getMinPrice(product.variants ?? [])}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.stockStatus === "sold_out"
                            ? "destructive"
                            : product.stockStatus === "low_stock"
                              ? "outline"
                              : "secondary"
                        }
                        className="capitalize"
                      >
                        {product.stockStatus?.replace("_", " ") ?? "in stock"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(product.tags ?? []).slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(product)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteId(product.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editingProduct}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The product will be permanently
              removed from your catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={submitting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
