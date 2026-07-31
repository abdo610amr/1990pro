import { useContext } from "react";
import { StoreSettingsContext } from "@/providers/StoreSettingsProvider";

export function useStoreSettings() {
  const context = useContext(StoreSettingsContext);
  if (!context) {
    throw new Error("useStoreSettings must be used within StoreSettingsProvider");
  }
  return context;
}

export function useLogoConfig() {
  const { settings } = useStoreSettings();
  return settings?.logo ?? null;
}

export function useHeroBanner() {
  const { settings } = useStoreSettings();
  return settings?.heroBanner ?? null;
}

export function useContactConfig() {
  const { settings } = useStoreSettings();
  return settings?.contact ?? null;
}

export function usePromoBanner() {
  const { settings } = useStoreSettings();
  return settings?.promoBanner ?? null;
}

export function useStoreName() {
  const { settings } = useStoreSettings();
  return settings?.storeName ?? "Store";
}
