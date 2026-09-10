"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { FolderTree, Plus, Edit, Trash2 } from "lucide-react";
import { posApi } from "@/lib/api";
import type { PosCategory } from "@/types/pos";
import { ErpPageHeader } from "@/components/erp/page-header";
import { ErpToolbar } from "@/components/erp/toolbar";
import { ErpTable, ErpTd, ErpTh } from "@/components/erp/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminCategoriesPage() {
  const categoriesQuery = useQuery({ queryKey: ["admin-categories"], queryFn: posApi.categories });

  const [query, setQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCat, setEditingCat] = useState<PosCategory | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  const categories = categoriesQuery.data ?? [];

  const filtered = categories.filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q);
  });

  const resetForm = () => {
    setName("");
    setDescription("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      await posApi.createCategory({ name: name.trim(), description: description.trim() });
      toast.success("Category created");
      setShowAddModal(false);
      resetForm();
      await categoriesQuery.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Creation failed");
    } finally {
      setBusy(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat || !name.trim()) return;
    setBusy(true);
    try {
      await posApi.updateCategory(editingCat.id, { name: name.trim(), description: description.trim() });
      toast.success("Category updated");
      setEditingCat(null);
      resetForm();
      await categoriesQuery.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (c: PosCategory) => {
    if (!confirm(`Delete category "${c.name}"?`)) return;
    try {
      await posApi.deleteCategory(c.id);
      toast.success("Category deleted");
      await categoriesQuery.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const startEdit = (c: PosCategory) => {
    setEditingCat(c);
    setName(c.name || "");
    setDescription(c.description || "");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <ErpPageHeader
          eyebrow="Taxonomy"
          title="Categories Management"
          description="Organize catalog products into logical store categories."
        />
        <Button onClick={() => { resetForm(); setShowAddModal(true); }} className="gap-2 self-start sm:self-auto">
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      <ErpToolbar
        search={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search categories…"
        onRefresh={() => void categoriesQuery.refetch()}
        refreshing={categoriesQuery.isFetching}
      />

      <ErpTable>
        <thead>
          <tr>
            <ErpTh>Category Name</ErpTh>
            <ErpTh>Slug</ErpTh>
            <ErpTh>Description</ErpTh>
            <ErpTh className="text-right">Actions</ErpTh>
          </tr>
        </thead>
        <tbody>
          {filtered.map((c) => (
            <tr key={c.id} className="hover:bg-secondary/40">
              <ErpTd className="font-semibold">{c.name}</ErpTd>
              <ErpTd className="font-mono text-xs text-muted-foreground">/{c.slug}</ErpTd>
              <ErpTd className="text-xs text-muted-foreground">{c.description || "—"}</ErpTd>
              <ErpTd>
                <div className="flex justify-end gap-1">
                  <Button size="sm" variant="outline" onClick={() => startEdit(c)}>
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => void handleDelete(c)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </ErpTd>
            </tr>
          ))}
        </tbody>
      </ErpTable>

      {/* Add / Edit Category Modal */}
      {(showAddModal || editingCat) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50">
          <Card className="w-full max-w-md shadow-2xl">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-heading text-2xl">{editingCat ? "Edit Category" : "Add Category"}</h2>
              <form onSubmit={editingCat ? handleUpdate : handleCreate} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Category Name *</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Footwear" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Description</label>
                  <textarea
                    className="w-full min-h-[80px] p-3 rounded-xl border bg-background text-sm"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Category description…"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); setEditingCat(null); }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={busy}>
                    {busy ? "Saving…" : editingCat ? "Update Category" : "Create Category"}
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
