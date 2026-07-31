import { THEME_CSS_VAR_MAP } from "@/config/theme.config";
import type { ThemeConfig } from "@/types/store-settings";

export function applyTheme(theme: ThemeConfig): void {
  const root = document.documentElement;

  root.style.setProperty("--radius", theme.radius);

  for (const [token, cssVar] of Object.entries(THEME_CSS_VAR_MAP)) {
    const value = theme.colors[token as keyof typeof theme.colors];
    if (value) {
      root.style.setProperty(cssVar, value);
    }
  }
}

export function applyFavicon(href: string | null | undefined): void {
  if (!href) return;

  let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");

  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }

  link.href = href;
}
