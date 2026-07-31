import type { ReactNode } from "react";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";

interface StoreSettingsGateProps {
  children: ReactNode;
}

/** Blocks the app until brand/store config is loaded and applied. */
export function StoreSettingsGate({ children }: StoreSettingsGateProps) {
  const { loading, error, reload } = useStoreSettings();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingState variant="page" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-8">
        <ErrorState
          message={`Store configuration failed to load: ${error}`}
          onRetry={() => void reload()}
        />
      </div>
    );
  }

  return children;
}
