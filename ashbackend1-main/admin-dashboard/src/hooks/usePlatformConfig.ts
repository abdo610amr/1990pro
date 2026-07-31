import { useCallback, useEffect, useState } from "react";
import { platformService } from "@/services/platform";
import { getErrorMessage } from "@/services/api";
import type { PlatformConfig } from "@/types/platform";

interface UsePlatformConfigResult {
  config: PlatformConfig | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePlatformConfig(): UsePlatformConfigResult {
  const [config, setConfig] = useState<PlatformConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await platformService.get();
      setConfig(result);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { config, loading, error, refetch };
}

export function useProductType() {
  const { config, loading, error, refetch } = usePlatformConfig();
  return {
    productType: config?.productType ?? "perfume",
    config,
    loading,
    error,
    refetch,
  };
}

export function useIsFashionMode() {
  const { productType } = useProductType();
  return productType === "fashion";
}
