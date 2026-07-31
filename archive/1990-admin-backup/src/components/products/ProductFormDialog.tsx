import { useEffect, useState } from "react";
import { Plus, UploadCloud, X } from "lucide-react";
import type {
  Product,
  ProductFormData,
  ProductVariant,
  VariantType,
} from "@/types/product";
import { VARIANT_TYPE_OPTIONS } from "@/types/product";
import { categoryService } from "@/services/categories";
import { usePlatformConfig } from "@/hooks/usePlatformConfig";
import { useAsyncData } from "@/hooks/useAsyncData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSubmit: (form: ProductFormData) => Promise<void>;
  submitting: boolean;
}

const emptyVariant = (): ProductVariant => ({
  label: "",
  price: 0,
  stock: 0,
  sku: null,
});

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  onSubmit,
  submitting,
}: ProductFormDialogProps) {
  const { data: categories } = useAsyncData(categoryService.getAll);
  const { config: platformConfig } = usePlatformConfig();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string>("none");
  const [variantType, setVariantType] = useState<VariantType>("fashion-size");
  const [variantLabel, setVariantLabel] = useState("Size");
  const [variants, setVariants] = useState<ProductVariant[]>([emptyVariant()]);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [tagsInput, setTagsInput] = useState("");
  const [cover, setCover] = useState<File | undefined>();
  const [gallery, setGallery] = useState<File[]>([]);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setCategoryId(product.categoryId ? String(product.categoryId) : "none");
      setVariantType(
        VARIANT_TYPE_OPTIONS.some((option) => option.value === product.variantType)
          ? product.variantType
          : "fashion-size"
      );
      setVariantLabel(product.variantLabel ?? "Size");
      const v = product.variants?.length
        ? product.variants
        : product.sizes?.map((s) => ({
            label: s.size,
            price: s.price,
            stock: s.stock ?? 0,
            sku: s.sku,
          })) ?? [emptyVariant()];
      setVariants(v.length ? v : [emptyVariant()]);
      setLowStockThreshold(product.lowStockThreshold ?? 5);
      setTagsInput((product.tags ?? []).join(", "));
    } else {
      setName("");
      setDescription("");
      setCategoryId("none");
      const defaults = platformConfig ?? {
        variantType: "fashion-size" as VariantType,
        variantLabel: "Size",
        variantPresets: ["S", "M", "L", "XL", "XXL"],
      };
      setVariantType(defaults.variantType as VariantType);
      setVariantLabel(defaults.variantLabel);
      setVariants(
        defaults.variantPresets.map((label) => ({
          label,
          price: 0,
          stock: 0,
          sku: null,
        }))
      );
      setLowStockThreshold(5);
      setTagsInput("");
    }
    setCover(undefined);
    setGallery([]);
  }, [product, open, platformConfig]);

  const handleVariantTypeChange = (type: VariantType) => {
    setVariantType(type);
    const option = VARIANT_TYPE_OPTIONS.find((o) => o.value === type);
    if (option) {
      setVariantLabel(option.defaultLabel);
      if (option.presets.length && !product) {
        setVariants(
          option.presets.map((label) => ({ label, price: 0, stock: 0, sku: null }))
        );
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    await onSubmit({
      name,
      description,
      categoryId: categoryId === "none" ? null : Number(categoryId),
      variantType,
      variantLabel,
      variants: variants.filter((v) => v.label && v.price >= 0),
      tags,
      lowStockThreshold,
      cover,
      gallery: gallery.length ? gallery : undefined,
    });
  };

  const updateVariant = (
    index: number,
    field: keyof ProductVariant,
    value: string
  ) => {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === index
          ? {
              ...v,
              [field]:
                field === "price" || field === "stock"
                  ? Number(value)
                  : value,
            }
          : v
      )
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add Product"}</DialogTitle>
          <DialogDescription>
            Clothing products use size, footwear, or custom variants.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No category</SelectItem>
                {categories?.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Variant Type</Label>
              <Select
                value={variantType}
                onValueChange={(v) => handleVariantTypeChange(v as VariantType)}
                disabled={Boolean(platformConfig && !product)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VARIANT_TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="variantLabel">Variant Label</Label>
              <Input
                id="variantLabel"
                value={variantLabel}
                onChange={(e) => setVariantLabel(e.target.value)}
                placeholder="e.g. Volume, Size"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{variantLabel} Options</Label>
            <div className="space-y-2">
              {variants.map((variant, index) => (
                <div
                  key={index}
                  className="grid gap-2 rounded-xl border bg-secondary/20 p-3 sm:grid-cols-[1fr_90px_90px_1fr_auto] sm:border-0 sm:bg-transparent sm:p-0"
                >
                  <Input
                    placeholder="Label"
                    value={variant.label}
                    onChange={(e) => updateVariant(index, "label", e.target.value)}
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Price"
                    value={variant.price || ""}
                    onChange={(e) => updateVariant(index, "price", e.target.value)}
                  />
                  <Input
                    type="number"
                    min="0"
                    placeholder="Stock"
                    value={variant.stock ?? ""}
                    onChange={(e) => updateVariant(index, "stock", e.target.value)}
                  />
                  <Input
                    placeholder="SKU"
                    value={variant.sku ?? ""}
                    onChange={(e) => updateVariant(index, "sku", e.target.value)}
                  />
                  {variants.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setVariants((prev) => prev.filter((_, i) => i !== index))
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setVariants((prev) => [...prev, emptyVariant()])}
            >
              <Plus className="h-4 w-4" />
              Add variant
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="threshold">Low Stock Threshold</Label>
            <Input
              id="threshold"
              type="number"
              min={1}
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="new, bestseller, limited"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cover">Cover Image</Label>
              <label
                htmlFor="cover"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  setCover(event.dataTransfer.files[0]);
                }}
                className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-primary/25 bg-secondary/25 p-4 text-center transition-colors hover:bg-secondary/50"
              >
                <UploadCloud className="mb-2 h-6 w-6 text-primary" />
                <span className="text-sm font-medium">Drop a cover or browse</span>
                <span className="mt-1 max-w-full truncate text-xs text-muted-foreground">
                  {cover?.name ?? (product?.coverImage ? "Current cover retained" : "PNG, JPG or WebP")}
                </span>
                <Input
                  id="cover"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => setCover(e.target.files?.[0])}
                />
              </label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gallery">Gallery Images</Label>
              <label
                htmlFor="gallery"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  setGallery(Array.from(event.dataTransfer.files));
                }}
                className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-primary/25 bg-secondary/25 p-4 text-center transition-colors hover:bg-secondary/50"
              >
                <UploadCloud className="mb-2 h-6 w-6 text-primary" />
                <span className="text-sm font-medium">Drop gallery images</span>
                <span className="mt-1 max-w-full truncate text-xs text-muted-foreground">
                  {gallery.length ? `${gallery.length} files selected` : "Select multiple images"}
                </span>
                <Input
                  id="gallery"
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(e) =>
                    setGallery(e.target.files ? Array.from(e.target.files) : [])
                  }
                />
              </label>
            </div>
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
              {submitting ? "Saving..." : product ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
