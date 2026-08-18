"use client";

import { useEffect, useState } from "react";
import { Plus, UploadCloud, X } from "lucide-react";
import type { PosBrand, PosCategory, PosProduct, PosVariant } from "@/types/pos";
import { mergeTagsWithMeta, parseProductMeta, type ProductMeta } from "@/lib/product-meta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type VariantType = "fashion-size" | "shoe-size" | "custom";

export interface ProductFormValues {
  name: string;
  description: string;
  categoryId: number | null;
  brandId: number | null;
  barcode?: string;
  productType: string;
  variantType: VariantType;
  variantLabel: string;
  variants: PosVariant[];
  tags: string[];
  lowStockThreshold: number;
  cover?: File;
  gallery?: File[];
}

const TABS = [
  "General",
  "Pricing",
  "Inventory",
  "Variants",
  "Images",
  "SEO",
  "Advanced",
] as const;

const VARIANT_TYPE_OPTIONS: {
  value: VariantType;
  label: string;
  defaultLabel: string;
  presets: string[];
}[] = [
  {
    value: "fashion-size",
    label: "Fashion Size",
    defaultLabel: "Size",
    presets: ["S", "M", "L", "XL", "XXL"],
  },
  {
    value: "shoe-size",
    label: "Shoe Size",
    defaultLabel: "Shoe Size",
    presets: ["36", "37", "38", "39", "40", "41", "42", "43", "44"],
  },
  {
    value: "custom",
    label: "Custom / Color",
    defaultLabel: "Option",
    presets: [],
  },
];

const emptyVariant = (): PosVariant => ({
  label: "",
  price: 0,
  stock: 0,
  sku: null,
});

export function buildProductFormData(form: ProductFormValues): FormData {
  const body = new FormData();
  body.append("name", form.name);
  body.append("description", form.description);
  body.append("variants", JSON.stringify(form.variants));
  body.append(
    "sizes",
    JSON.stringify(
      form.variants.map((v) => ({
        size: v.label,
        price: v.price,
        stock: v.stock,
        sku: v.sku,
      }))
    )
  );
  body.append("tags", JSON.stringify(form.tags));
  body.append("variantType", form.variantType);
  body.append("variantLabel", form.variantLabel);
  body.append("lowStockThreshold", String(form.lowStockThreshold));
  body.append("productType", form.productType);
  if (form.categoryId) body.append("categoryId", String(form.categoryId));
  if (form.brandId) body.append("brandId", String(form.brandId));
  if (form.barcode) body.append("barcode", form.barcode);
  if (form.cover) body.append("cover", form.cover);
  form.gallery?.forEach((file) => body.append("gallery", file));
  return body;
}

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: PosProduct | null;
  categories: PosCategory[];
  brands: PosBrand[];
  onSubmit: (form: ProductFormValues) => Promise<void>;
  submitting: boolean;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  categories,
  brands,
  onSubmit,
  submitting,
}: ProductFormDialogProps) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("General");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("none");
  const [brandId, setBrandId] = useState("none");
  const [productType, setProductType] = useState("originals");
  const [variantType, setVariantType] = useState<VariantType>("fashion-size");
  const [variantLabel, setVariantLabel] = useState("Size");
  const [variants, setVariants] = useState<PosVariant[]>([emptyVariant()]);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [tagsInput, setTagsInput] = useState("");
  const [cover, setCover] = useState<File | undefined>();
  const [gallery, setGallery] = useState<File[]>([]);
  const [meta, setMeta] = useState<ProductMeta>({
    status: "active",
    featured: false,
  });
  const [basePrice, setBasePrice] = useState(0);

  useEffect(() => {
    if (product) {
      const parsed = parseProductMeta(product.tags);
      setName(product.name);
      setDescription(product.description ?? "");
      setCategoryId(product.categoryId ? String(product.categoryId) : "none");
      setBrandId(product.brandId ? String(product.brandId) : "none");
      setProductType(product.productType || "originals");
      const vt = (product.variantType as VariantType) || "fashion-size";
      setVariantType(
        VARIANT_TYPE_OPTIONS.some((o) => o.value === vt) ? vt : "fashion-size"
      );
      setVariantLabel(product.variantLabel ?? "Size");
      setVariants(product.variants?.length ? product.variants : [emptyVariant()]);
      setLowStockThreshold(product.lowStockThreshold ?? 5);
      setTagsInput(parsed.tags.join(", "));
      setMeta(parsed.meta);
      setBasePrice(
        product.variants?.[0]?.price ??
          parsed.meta.salePrice ??
          0
      );
    } else {
      setName("");
      setDescription("");
      setCategoryId("none");
      setBrandId("none");
      setProductType("originals");
      setVariantType("fashion-size");
      setVariantLabel("Size");
      setVariants(
        ["S", "M", "L", "XL", "XXL"].map((label) => ({
          label,
          price: 0,
          stock: 0,
          sku: null,
        }))
      );
      setLowStockThreshold(5);
      setTagsInput("");
      setMeta({ status: "active", featured: false, location: "Main store" });
      setBasePrice(0);
    }
    setCover(undefined);
    setGallery([]);
    setTab("General");
  }, [product, open]);

  const applyBasePrice = (price: number) => {
    setBasePrice(price);
    setVariants((prev) => prev.map((v) => ({ ...v, price })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const slug =
      meta.slug?.trim() ||
      name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    await onSubmit({
      name,
      description,
      categoryId: categoryId === "none" ? null : Number(categoryId),
      brandId: brandId === "none" ? null : Number(brandId),
      productType,
      variantType,
      variantLabel,
      variants: variants.filter((v) => v.label),
      tags: mergeTagsWithMeta(cleanTags, { ...meta, slug }),
      lowStockThreshold,
      cover,
      gallery: gallery.length ? gallery : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="w-[min(100%-1rem,56rem)]">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{product ? "Edit product" : "Add product"}</DialogTitle>
          <DialogDescription>
            Full ERP product editor — saved to the shared catalog API.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-1 overflow-x-auto border-b px-1">
          {TABS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={cn(
                "shrink-0 rounded-t-lg px-3 py-2 text-sm font-medium transition",
                tab === item
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary"
              )}
            >
              {item}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <DialogBody className="space-y-4">
            {tab === "General" && (
              <>
                <Field label="Name">
                  <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </Field>
                <Field label="Slug">
                  <Input
                    value={meta.slug ?? ""}
                    onChange={(e) => setMeta((m) => ({ ...m, slug: e.target.value }))}
                    placeholder="auto-generated-from-name"
                  />
                </Field>
                <Field label="Description">
                  <Textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Field>
                <div className="grid gap-3 md:grid-cols-3">
                  <Field label="Category">
                    <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                      <option value="none">None</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Brand *">
                    <Select value={brandId} onChange={(e) => setBrandId(e.target.value)} required>
                      <option value="none" disabled>Select active brand...</option>
                      {brands.filter((b) => b.status !== "disabled" && b.active !== false).map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.barcodePrefix || "1990"})
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Catalog type">
                    <Select value={productType} onChange={(e) => setProductType(e.target.value)}>
                      <option value="originals">Originals</option>
                      <option value="showroom">Showroom</option>
                    </Select>
                  </Field>
                </div>
                <Field label="Tags">
                  <Input
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="summer, cotton, limited"
                  />
                </Field>
              </>
            )}

            {tab === "Pricing" && (
              <>
                <div className="grid gap-3 md:grid-cols-3">
                  <Field label="Price">
                    <Input
                      type="number"
                      value={basePrice}
                      onChange={(e) => applyBasePrice(Number(e.target.value) || 0)}
                    />
                  </Field>
                  <Field label="Sale price">
                    <Input
                      type="number"
                      value={meta.salePrice ?? ""}
                      onChange={(e) =>
                        setMeta((m) => ({
                          ...m,
                          salePrice: e.target.value === "" ? undefined : Number(e.target.value),
                        }))
                      }
                    />
                  </Field>
                  <Field label="Cost">
                    <Input
                      type="number"
                      value={meta.cost ?? ""}
                      onChange={(e) =>
                        setMeta((m) => ({
                          ...m,
                          cost: e.target.value === "" ? undefined : Number(e.target.value),
                        }))
                      }
                    />
                  </Field>
                </div>
                <p className="text-xs text-muted-foreground">
                  Price applies to all variants (override per variant in Variants tab). Cost & sale
                  price are stored in product meta tags.
                </p>
              </>
            )}

            {tab === "Inventory" && (
              <>
                <div className="grid gap-3 md:grid-cols-3">
                  <Field label="Primary SKU">
                    <Input
                      value={variants[0]?.sku ?? ""}
                      onChange={(e) =>
                        setVariants((prev) =>
                          prev.map((v, i) => (i === 0 ? { ...v, sku: e.target.value } : v))
                        )
                      }
                    />
                  </Field>
                  <Field label="Barcode">
                    <Input
                      value={meta.barcode ?? ""}
                      onChange={(e) => setMeta((m) => ({ ...m, barcode: e.target.value }))}
                    />
                  </Field>
                  <Field label="Low stock threshold">
                    <Input
                      type="number"
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(Number(e.target.value) || 0)}
                    />
                  </Field>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Weight (kg)">
                    <Input
                      type="number"
                      value={meta.weight ?? ""}
                      onChange={(e) =>
                        setMeta((m) => ({
                          ...m,
                          weight: e.target.value === "" ? undefined : Number(e.target.value),
                        }))
                      }
                    />
                  </Field>
                  <Field label="Location">
                    <Input
                      value={meta.location ?? "Main store"}
                      onChange={(e) => setMeta((m) => ({ ...m, location: e.target.value }))}
                    />
                  </Field>
                </div>
              </>
            )}

            {tab === "Variants" && (
              <>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Variant type">
                    <Select
                      value={variantType}
                      onChange={(e) => {
                        const type = e.target.value as VariantType;
                        setVariantType(type);
                        const option = VARIANT_TYPE_OPTIONS.find((o) => o.value === type);
                        if (option) {
                          setVariantLabel(option.defaultLabel);
                          if (option.presets.length && !product) {
                            setVariants(
                              option.presets.map((label) => ({
                                label,
                                price: basePrice,
                                stock: 0,
                                sku: null,
                              }))
                            );
                          }
                        }
                      }}
                    >
                      {VARIANT_TYPE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Variant label">
                    <Input
                      value={variantLabel}
                      onChange={(e) => setVariantLabel(e.target.value)}
                    />
                  </Field>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Sizes / colors / options</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setVariants((prev) => [
                          ...prev,
                          { ...emptyVariant(), price: basePrice },
                        ])
                      }
                    >
                      <Plus className="h-3.5 w-3.5" /> Add
                    </Button>
                  </div>
                  {variants.map((variant, index) => (
                    <div key={index} className="grid gap-2 md:grid-cols-5">
                      <Input
                        placeholder="Label"
                        value={variant.label}
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((v, i) =>
                              i === index ? { ...v, label: e.target.value } : v
                            )
                          )
                        }
                      />
                      <Input
                        type="number"
                        placeholder="Price"
                        value={variant.price}
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((v, i) =>
                              i === index
                                ? { ...v, price: Number(e.target.value) || 0 }
                                : v
                            )
                          )
                        }
                      />
                      <Input
                        type="number"
                        placeholder="Stock"
                        value={variant.stock}
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((v, i) =>
                              i === index
                                ? { ...v, stock: Number(e.target.value) || 0 }
                                : v
                            )
                          )
                        }
                      />
                      <Input
                        placeholder="SKU"
                        value={variant.sku ?? ""}
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((v, i) =>
                              i === index ? { ...v, sku: e.target.value } : v
                            )
                          )
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() =>
                          setVariants((prev) => prev.filter((_, i) => i !== index))
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === "Images" && (
              <>
                <Field label="Cover image">
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-6 text-sm text-muted-foreground hover:bg-secondary/40">
                    <UploadCloud className="mb-2 h-6 w-6" />
                    {cover ? cover.name : "Upload cover"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setCover(e.target.files?.[0])}
                    />
                  </label>
                </Field>
                <Field label="Gallery (multiple)">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setGallery(Array.from(e.target.files ?? []))}
                  />
                  {gallery.length > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {gallery.length} file(s) selected
                    </p>
                  )}
                </Field>
              </>
            )}

            {tab === "SEO" && (
              <>
                <Field label="SEO title">
                  <Input
                    value={meta.seoTitle ?? ""}
                    onChange={(e) => setMeta((m) => ({ ...m, seoTitle: e.target.value }))}
                  />
                </Field>
                <Field label="SEO description">
                  <Textarea
                    rows={4}
                    value={meta.seoDescription ?? ""}
                    onChange={(e) =>
                      setMeta((m) => ({ ...m, seoDescription: e.target.value }))
                    }
                  />
                </Field>
              </>
            )}

            {tab === "Advanced" && (
              <>
                <div className="flex items-center justify-between rounded-xl border p-3">
                  <div>
                    <Label>Featured</Label>
                    <p className="text-xs text-muted-foreground">Highlight in catalogs</p>
                  </div>
                  <Switch
                    checked={Boolean(meta.featured)}
                    onCheckedChange={(checked) =>
                      setMeta((m) => ({ ...m, featured: checked }))
                    }
                  />
                </div>
                <Field label="Status">
                  <Select
                    value={meta.status ?? "active"}
                    onChange={(e) =>
                      setMeta((m) => ({
                        ...m,
                        status: e.target.value as ProductMeta["status"],
                      }))
                    }
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </Select>
                </Field>
              </>
            )}
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : product ? "Update product" : "Create product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
