import Image from "next/image";
import { cn } from "@/lib/utils";
import { SITE_NAME } from "@/lib/constants";

interface BrandLogoProps {
  className?: string;
  priority?: boolean;
}

export function BrandLogo({ className, priority = false }: BrandLogoProps) {
  return (
    <span
      className={cn(
        "relative block h-11 w-36 shrink-0 overflow-hidden bg-[#f7f3ec]",
        className
      )}
    >
      <Image
        src="/brand-logo.png"
        alt={`${SITE_NAME} — Made for Originals`}
        fill
        priority={priority}
        sizes="(max-width: 768px) 128px, 176px"
        className="scale-[1.03] object-cover object-center"
      />
    </span>
  );
}
