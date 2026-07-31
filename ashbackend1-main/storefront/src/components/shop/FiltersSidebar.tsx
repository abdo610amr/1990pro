import { SlidersHorizontal } from "lucide-react";
import type { Category } from "@/types/product";
import { cn } from "@/lib/utils";

interface FiltersSidebarProps {
  categories: Category[];
  selectedCategoryIds: number[];
  onCategoryToggle: (categoryId: number) => void;
  minPrice: number;
  maxPrice: number;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  onClear: () => void;
  className?: string;
  enableSizeFilter?: boolean;
  availableSizes?: string[];
  selectedSizes?: string[];
  onSizeToggle?: (size: string) => void;
  sizeFilterLabel?: string;
}

export function FiltersSidebar({
  categories,
  selectedCategoryIds,
  onCategoryToggle,
  minPrice,
  maxPrice,
  priceRange,
  onPriceRangeChange,
  onClear,
  className,
  enableSizeFilter = false,
  availableSizes = [],
  selectedSizes = [],
  onSizeToggle,
  sizeFilterLabel = "Size",
}: FiltersSidebarProps) {
  const hasFilters =
    selectedCategoryIds.length > 0 ||
    selectedSizes.length > 0 ||
    priceRange[0] > minPrice ||
    priceRange[1] < maxPrice;

  return (
    <aside className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">Filters</h3>
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-primary hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Categories
        </h4>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const selected = selectedCategoryIds.includes(category.id);
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onCategoryToggle(category.id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition",
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-accent"
                )}
              >
                {category.name}
              </button>
            );
          })}
        </div>
      </div>

      {enableSizeFilter && availableSizes.length > 0 && onSizeToggle && (
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {sizeFilterLabel}
          </h4>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size) => {
              const selected = selectedSizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => onSizeToggle(size)}
                  className={cn(
                    "min-w-[2.5rem] rounded-lg px-3 py-1.5 text-xs font-medium transition",
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-accent"
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Price Range
        </h4>
        <div className="space-y-3">
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={priceRange[1]}
            onChange={(e) =>
              onPriceRangeChange([priceRange[0], Number(e.target.value)])
            }
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
