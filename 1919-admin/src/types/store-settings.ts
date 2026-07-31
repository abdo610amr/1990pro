/**
 * Store & brand settings types.
 * Config is loaded from JSON today; swap the loader later for API / multi-brand.
 */

export interface ThemeColorTokens {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  border: string;
  input: string;
  ring: string;
  sidebar: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
}

export interface ThemeConfig {
  radius: string;
  colors: ThemeColorTokens;
}

export interface LogoConfig {
  /** Image URL or path. When null, monogram/icon fallback is used. */
  src: string | null;
  alt: string;
  width?: number;
  height?: number;
  favicon?: string | null;
  /** Shown when src is null (e.g. "AS") */
  monogram?: string;
}

export interface HeroBannerConfig {
  enabled: boolean;
  image: string | null;
  title: string;
  subtitle: string;
}

export interface StoreSettings {
  /** Identifier for future multi-brand switching */
  brandId: string;
  storeName: string;
  tagline: string;
  theme: ThemeConfig;
  logo: LogoConfig;
  heroBanner: HeroBannerConfig;
}

export type StoreSettingsLoader = () => Promise<StoreSettings>;
