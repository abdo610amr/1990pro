import { Loader2 } from "lucide-react";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { ErrorState } from "@/components/ui/ErrorState";

interface StoreSettingsGateProps {
  children: React.ReactNode;
}

export function StoreSettingsGate({ children }: StoreSettingsGateProps) {
  const { loading, error, reload } = useStoreSettings();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <ErrorState message={error} onRetry={reload} />
      </div>
    );
  }

  return <>{children}</>;
}
