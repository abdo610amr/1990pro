import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { StoreSettingsProvider } from "@/providers/StoreSettingsProvider";
import { StoreSettingsGate } from "@/components/brand/StoreSettingsGate";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={250}>
        <StoreSettingsProvider>
          <StoreSettingsGate>{children}</StoreSettingsGate>
        </StoreSettingsProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
