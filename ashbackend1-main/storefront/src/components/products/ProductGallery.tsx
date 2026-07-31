import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  coverImage: string;
  gallery: string[];
  productName: string;
}

export function ProductGallery({ coverImage, gallery, productName }: ProductGalleryProps) {
  const images = [coverImage, ...gallery.filter((img) => img !== coverImage)];
  const [activeIndex, setActiveIndex] = useState(0);

  const goTo = (index: number) => {
    setActiveIndex((index + images.length) % images.length);
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted">
        <img
          src={images[activeIndex]}
          alt={`${productName} - image ${activeIndex + 1}`}
          className="h-full w-full object-cover"
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow backdrop-blur transition hover:bg-background"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow backdrop-blur transition hover:bg-background"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, index) => (
            <button
              key={`${img}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "h-20 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition",
                index === activeIndex ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
