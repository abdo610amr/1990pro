"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useEffect, useState, type ReactNode } from "react";
import { CatalogProvider } from "@/providers/catalog-provider";
import { useAuthStore } from "@/store/auth-store";
import { useWishlistStore } from "@/store/wishlist-store";

export function Providers({ children }: { children: ReactNode }) {
  const hydrateAuth = useAuthStore((state) => state.hydrate);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  useEffect(() => {
    void hydrateAuth().then(() => useWishlistStore.getState().sync());
  }, [hydrateAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        <CatalogProvider>{children}</CatalogProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
