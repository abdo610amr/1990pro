import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";

export type Product = {
  name: string;
  price: string;
  image: string;
  tag?: string;
};

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { ref, visible } = useReveal<HTMLDivElement>(0.12);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${index * 120}ms` }}
      className={cn("reveal group", visible && "is-visible")}
    >
      <a href="#final" className="block">
        <div className="relative overflow-hidden bg-secondary">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            width={1024}
            height={1280}
            className="aspect-[4/5] w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
          />
          {product.tag && (
            <span className="label absolute left-4 top-4 bg-background/85 px-2 py-1 text-primary">
              {product.tag}
            </span>
          )}
          <span className="label absolute bottom-0 left-0 right-0 translate-y-full bg-primary py-3 text-center text-primary-foreground transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0">
            View
          </span>
        </div>

        <div className="mt-5 flex items-baseline justify-between border-t border-border pt-4">
          <h3 className="text-[0.95rem] font-medium uppercase tracking-[0.12em] text-primary">
            {product.name}
          </h3>
          <span className="text-sm text-wine/70">{product.price}</span>
        </div>
      </a>
    </div>
  );
}
