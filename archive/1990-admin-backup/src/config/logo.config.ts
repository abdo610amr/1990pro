import type { LogoConfig } from "@/types/store-settings";

export const DEFAULT_LOGO: LogoConfig = {
  src: "/brand-logo.png",
  alt: "1990 — Made For Originals",
  monogram: "90",
  favicon: null,
};

/** Resolve logo image URL (supports absolute URLs and public paths). */
export function resolveLogoSrc(src: string | null): string | null {
  if (!src) return null;
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) {
    return src;
  }
  return src.startsWith("/") ? src : `/${src}`;
}
