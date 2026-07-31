import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "@/services/api";

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
): UseAsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
