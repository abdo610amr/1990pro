import { Sparkles } from "lucide-react";
import { resolveLogoSrc } from "@/config/logo.config";
import { useLogoConfig } from "@/hooks/useStoreSettings";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  imageClassName?: string;
  monogramClassName?: string;
  showFallbackIcon?: boolean;
}

export function BrandLogo({
  className,
  imageClassName,
  monogramClassName,
  showFallbackIcon = true,
}: BrandLogoProps) {
  const logo = useLogoConfig();
  const src = resolveLogoSrc(logo?.src ?? null);

  if (src) {
    return (
      <img
        src={src}
        alt={logo?.alt ?? "Store logo"}
        width={logo?.width}
        height={logo?.height}
        className={cn("h-9 w-9 rounded-lg object-cover", imageClassName, className)}
      />
    );
  }

  if (logo?.monogram) {
    return (
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground",
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
          "flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary",
          className
        )}
      >
        <Sparkles className="h-5 w-5 text-sidebar-primary-foreground" />
      </div>
    );
  }

  return null;
}
