import type { ContactConfig, PromoBannerConfig, StoreSettings, StoreSettingsLoader } from "@/types/store-settings";
import { DEFAULT_THEME } from "@/config/theme.config";
import { DEFAULT_LOGO } from "@/config/logo.config";

const CONFIG_PATH = "/config/store.settings.json";

const DEFAULT_CONTACT: ContactConfig = {
  email: "hello@example.com",
  phone: "+1 555-0100",
  address: "123 Main Street",
  hours: "Mon – Sat, 10:00 AM – 9:00 PM",
  whatsapp: "+15550100",
  social: {},
};

const DEFAULT_PROMO_BANNER: PromoBannerConfig = {
  enabled: true,
  title: "Exclusive Offers Available",
  subtitle: "Apply a coupon at checkout",
};

function mergeWithDefaults(partial: Partial<StoreSettings>): StoreSettings {
  return {
    brandId: partial.brandId ?? "default",
    storeName: partial.storeName ?? "Store",
    tagline: partial.tagline ?? "Luxury Fragrances",
    theme: {
      radius: partial.theme?.radius ?? DEFAULT_THEME.radius,
      colors: { ...DEFAULT_THEME.colors, ...partial.theme?.colors },
    },
    logo: { ...DEFAULT_LOGO, ...partial.logo },
    heroBanner: {
      enabled: partial.heroBanner?.enabled ?? true,
      image: partial.heroBanner?.image ?? null,
      title: partial.heroBanner?.title ?? "Discover Your Signature Scent",
      subtitle: partial.heroBanner?.subtitle ?? "",
    },
    contact: { ...DEFAULT_CONTACT, ...partial.contact },
    promoBanner: { ...DEFAULT_PROMO_BANNER, ...partial.promoBanner },
  };
}

export const loadStoreSettings: StoreSettingsLoader = async () => {
  const response = await fetch(CONFIG_PATH);

  if (!response.ok) {
    throw new Error(`Failed to load store settings (${response.status})`);
  }

  const data = (await response.json()) as Partial<StoreSettings>;
  return mergeWithDefaults(data);
};
