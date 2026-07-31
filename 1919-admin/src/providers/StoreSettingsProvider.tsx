import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { StoreSettings, StoreSettingsLoader } from "@/types/store-settings";
import { loadStoreSettings } from "@/config/loadStoreSettings";
import { applyFavicon, applyTheme } from "@/lib/applyTheme";

interface StoreSettingsContextValue {
  settings: StoreSettings | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export const StoreSettingsContext =
  createContext<StoreSettingsContextValue | null>(null);

interface StoreSettingsProviderProps {
  children: ReactNode;
  /** Override loader for tests or future brand switching */
  loader?: StoreSettingsLoader;
}

function applyBranding(settings: StoreSettings): void {
  applyTheme(settings.theme);
  applyFavicon(settings.logo.favicon);
  document.title = `${settings.storeName} Admin`;
}

export function StoreSettingsProvider({
  children,
  loader = loadStoreSettings,
}: StoreSettingsProviderProps) {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const next = await loader();
      applyBranding(next);
      setSettings(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load store settings");
      setSettings(null);
    } finally {
      setLoading(false);
    }
  }, [loader]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const value = useMemo(
    () => ({ settings, loading, error, reload }),
    [settings, loading, error, reload]
  );

  return (
    <StoreSettingsContext.Provider value={value}>
      {children}
    </StoreSettingsContext.Provider>
  );
}
