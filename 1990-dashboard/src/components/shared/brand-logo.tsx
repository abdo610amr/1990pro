import Image from "next/image";
import { cn } from "@/lib/utils";
import { SITE_NAME } from "@/lib/constants";

export function BrandLogo({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <span
      className={cn(
        "relative block h-12 w-40 shrink-0 overflow-hidden bg-[#f7f3ec]",
        className
      )}
    >
      <Image
        src="/brand-logo.png"
        alt={`${SITE_NAME} — Made For Originals`}
        fill
        priority={priority}
        sizes="180px"
        className="object-cover object-center"
      />
    </span>
  );
}
