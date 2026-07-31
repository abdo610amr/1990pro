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
  src: string | null;
  alt: string;
  width?: number;
  height?: number;
  favicon?: string | null;
  monogram?: string;
}

export interface HeroBannerConfig {
  enabled: boolean;
  image: string | null;
  title: string;
  subtitle: string;
}

export interface ContactConfig {
  email: string;
  phone: string;
  address: string;
  hours: string;
  whatsapp: string;
  social: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
  };
}

export interface PromoBannerConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
}

export interface StoreSettings {
  brandId: string;
  storeName: string;
  tagline: string;
  theme: ThemeConfig;
  logo: LogoConfig;
  heroBanner: HeroBannerConfig;
  contact?: ContactConfig;
  promoBanner?: PromoBannerConfig;
}

export type StoreSettingsLoader = () => Promise<StoreSettings>;
