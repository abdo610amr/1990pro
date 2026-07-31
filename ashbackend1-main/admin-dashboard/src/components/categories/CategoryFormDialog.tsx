import { useEffect, useState } from "react";
import type { Category, CategoryFormData } from "@/types/category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onSubmit: (form: CategoryFormData) => Promise<void>;
  submitting: boolean;
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  onSubmit,
  submitting,
}: CategoryFormDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(1);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description);
      setSortOrder(category.sortOrder);
      setActive(category.active);
    } else {
      setName("");
      setDescription("");
      setSortOrder(1);
      setActive(true);
    }
  }, [category, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ name, description, sortOrder, active });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{category ? "Edit Category" : "Add Category"}</DialogTitle>
          <DialogDescription>
            Categories appear in the storefront filter sidebar and home page.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cat-name">Name</Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cat-desc">Description</Label>
            <Textarea
              id="cat-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cat-order">Sort Order</Label>
            <Input
              id="cat-order"
              type="number"
              min={1}
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="cat-active">Active</Label>
            <Switch id="cat-active" checked={active} onCheckedChange={setActive} />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : category ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
