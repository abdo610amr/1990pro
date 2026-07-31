import type { LogoConfig } from "@/types/store-settings";

export const DEFAULT_LOGO: LogoConfig = {
  src: null,
  alt: "Store",
  monogram: "ST",
  favicon: null,
};

export function resolveLogoSrc(src: string | null): string | null {
  if (!src) return null;
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) {
    return src;
  }
  return src.startsWith("/") ? src : `/${src}`;
}
