"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { SORT_OPTIONS } from "@/lib/constants";
import type { Brand, Category, Product, ProductFilters } from "@/types";

interface ShopFiltersProps {
  filters: ProductFilters;
  onFilterChange: (filters: ProductFilters) => void;
  productCount: number;
  categories: Category[];
  brands: Brand[];
  products: Product[];
}

export function ShopFilters({
  filters,
  onFilterChange,
  productCount,
  categories,
  brands,
  products,
}: ShopFiltersProps) {
  const colors = [
    ...new Set(
      products.flatMap((product) =>
        product.colors
          .map((color) => color.name)
          .filter((color) => color !== "Default")
      )
    ),
  ];
  const sizes = [
    ...new Set(
      products.flatMap((product) =>
        product.sizes.map((size) => size.label)
      )
    ),
  ];
  const update = (partial: Partial<ProductFilters>) => {
    onFilterChange({ ...filters, ...partial });
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <Label className="mb-3 block text-xs tracking-wider uppercase">Category</Label>
        <Select
          value={filters.category ?? "all"}
          onValueChange={(v) =>
            update({ category: !v || v === "all" ? undefined : v })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div>
        <Label className="mb-3 block text-xs tracking-wider uppercase">Brand</Label>
        <Select
          value={filters.brand ?? "all"}
          onValueChange={(v) =>
            update({ brand: !v || v === "all" ? undefined : v })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Brands" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div>
        <Label className="mb-3 block text-xs tracking-wider uppercase">Color</Label>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() =>
                update({
                  color: filters.color === color.toLowerCase() ? undefined : color.toLowerCase(),
                })
              }
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                filters.color === color.toLowerCase()
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary"
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <Label className="mb-3 block text-xs tracking-wider uppercase">Size</Label>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() =>
                update({ size: filters.size === size ? undefined : size })
              }
              className={`flex h-10 w-10 items-center justify-center rounded-lg border text-xs transition-colors ${
                filters.size === size
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <Label className="mb-3 block text-xs tracking-wider uppercase">
          Price Range
        </Label>
        <Slider
          defaultValue={[filters.minPrice ?? 0, filters.maxPrice ?? 1500]}
          min={0}
          max={1500}
          step={25}
          onValueChange={(value) => {
            if (Array.isArray(value)) {
              update({ minPrice: value[0], maxPrice: value[1] });
            }
          }}
          className="mt-4"
        />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>${filters.minPrice ?? 0}</span>
          <span>${filters.maxPrice ?? 1500}</span>
        </div>
      </div>

      <Separator />

      <div className="flex items-center gap-2">
        <Checkbox
          id="in-stock"
          checked={filters.availability === "in-stock"}
          onCheckedChange={(checked) =>
            update({ availability: checked ? "in-stock" : "all" })
          }
        />
        <Label htmlFor="in-stock" className="text-sm">
          In Stock Only
        </Label>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-24 rounded-2xl border bg-card p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-sm font-medium tracking-wider uppercase">Filters</h3>
            <span className="text-xs text-muted-foreground">{productCount} items</span>
          </div>
          {FilterContent()}
          <Button
            variant="outline"
            className="mt-6 w-full rounded-full"
            onClick={() => onFilterChange({ sort: filters.sort, type: filters.type })}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      <Sheet>
        <SheetTrigger
          render={
            <Button variant="outline" className="rounded-full lg:hidden">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>
          }
        />
        <SheetContent side="left" className="w-80 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-8">
            {FilterContent()}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export function SortSelect({
  value,
  onChange,
}: {
  value?: string;
  onChange: (value: string) => void;
}) {
  return (
    <Select
      value={value ?? "newest"}
      onValueChange={(nextValue) => nextValue && onChange(nextValue)}
    >
      <SelectTrigger className="w-[200px] rounded-full">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
