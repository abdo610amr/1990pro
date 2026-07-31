import { Sparkles } from "lucide-react";
import { resolveLogoSrc } from "@/config/logo.config";
import { useLogoConfig } from "@/hooks/useStoreSettings";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  imageClassName?: string;
  monogramClassName?: string;
  showFallbackIcon?: boolean;
  compact?: boolean;
}

export function BrandLogo({
  className,
  imageClassName,
  monogramClassName,
  showFallbackIcon = true,
  compact = false,
}: BrandLogoProps) {
  const logo = useLogoConfig();
  const src = resolveLogoSrc(logo?.src ?? null);

  if (src) {
    return (
      <span
        className={cn(
          "relative block shrink-0 overflow-hidden rounded-xl bg-[#f7f3ec]",
          compact ? "h-10 w-10" : "h-11 w-[7.5rem]",
          className
        )}
      >
        <img
          src={src}
          alt={logo?.alt ?? "1990 — Made For Originals"}
          width={compact ? 40 : 120}
          height={compact ? 40 : 44}
          className={cn(
            "h-full w-full object-cover object-center",
            imageClassName
          )}
        />
      </span>
    );
  }

  if (logo?.monogram) {
    return (
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground",
          monogramClassName,
          className
        )}
        aria-label={logo.alt}
      >
        {logo.monogram}
      </div>
    );
  }

  if (showFallbackIcon) {
    return (
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary",
          className
        )}
      >
        <Sparkles className="h-5 w-5 text-sidebar-primary-foreground" />
      </div>
    );
  }

  return null;
}
