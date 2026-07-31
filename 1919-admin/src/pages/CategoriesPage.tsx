import { useState } from "react";
import { Plus, Pencil, Trash2, FolderTree } from "lucide-react";
import { toast } from "sonner";
import { categoryService } from "@/services/categories";
import { useAsyncData } from "@/hooks/useAsyncData";
import type { Category, CategoryFormData } from "@/types/category";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { CategoryFormDialog } from "@/components/categories/CategoryFormDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

export function CategoriesPage() {
  const { data: categories, loading, error, refetch } = useAsyncData(
    categoryService.getAll
  );
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (form: CategoryFormData) => {
    setSubmitting(true);
    try {
      if (editing) {
        await categoryService.update(editing.id, form);
        toast.success("Category updated");
      } else {
        await categoryService.create(form);
        toast.success("Category created");
      }
      setFormOpen(false);
      setEditing(null);
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSubmitting(true);
    try {
      await categoryService.remove(deleteId);
      toast.success("Category deleted");
      setDeleteId(null);
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Manage product categories for storefront filtering."
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        }
      />

      {loading && (
        <Card>
          <CardContent className="p-0">
            <LoadingState rows={5} />
          </CardContent>
        </Card>
      )}

      {error && <ErrorState message={error} onRetry={refetch} />}

      {!loading && !error && categories?.length === 0 && (
        <EmptyState
          icon={FolderTree}
          title="No categories yet"
          description="Create categories to organize your catalog."
          action={
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          }
        />
      )}

      {!loading && !error && categories && categories.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{cat.name}</p>
                        {cat.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {cat.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{cat.slug}</TableCell>
                    <TableCell>{cat.sortOrder}</TableCell>
                    <TableCell>
                      <Badge variant={cat.active ? "default" : "secondary"}>
                        {cat.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditing(cat);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteId(cat.id)}
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

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editing}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              Products linked to this category will keep their assignment but the
              category will no longer appear in filters.
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
