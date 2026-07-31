import type { StoreSettings, StoreSettingsLoader } from "@/types/store-settings";
import { DEFAULT_THEME } from "@/config/theme.config";
import { DEFAULT_LOGO } from "@/config/logo.config";

const CONFIG_PATH = "/config/store.settings.json";

function mergeWithDefaults(partial: Partial<StoreSettings>): StoreSettings {
  return {
    brandId: partial.brandId ?? "default",
    storeName: partial.storeName ?? "Store",
    tagline: partial.tagline ?? "Admin Dashboard",
    theme: {
      radius: partial.theme?.radius ?? DEFAULT_THEME.radius,
      colors: { ...DEFAULT_THEME.colors, ...partial.theme?.colors },
    },
    logo: { ...DEFAULT_LOGO, ...partial.logo },
    heroBanner: {
      enabled: partial.heroBanner?.enabled ?? false,
      image: partial.heroBanner?.image ?? null,
      title: partial.heroBanner?.title ?? "Welcome back",
      subtitle: partial.heroBanner?.subtitle ?? "",
    },
  };
}

/**
 * Loads store settings from public/config/store.settings.json.
 * Replace this loader later to fetch per-brand config from an API.
 */
export const loadStoreSettings: StoreSettingsLoader = async () => {
  const response = await fetch(CONFIG_PATH);

  if (!response.ok) {
    throw new Error(`Failed to load store settings (${response.status})`);
  }

  const data = (await response.json()) as Partial<StoreSettings>;
  return mergeWithDefaults(data);
};

/** Future multi-brand: loadStoreSettingsForBrand(brandId) */
export function createBrandSettingsLoader(brandId: string): StoreSettingsLoader {
  return async () => {
    const response = await fetch(`/config/brands/${brandId}/store.settings.json`);

    if (!response.ok) {
      throw new Error(`Failed to load settings for brand "${brandId}"`);
    }

    const data = (await response.json()) as Partial<StoreSettings>;
    return mergeWithDefaults({ ...data, brandId });
  };
}
