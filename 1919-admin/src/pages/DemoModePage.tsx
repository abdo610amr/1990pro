import { Shirt, Sparkles } from "lucide-react";
import { usePlatformConfig } from "@/hooks/usePlatformConfig";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function DemoModePage() {
  const { config, loading, error, refetch } = usePlatformConfig();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catalog Configuration"
        description="Review the active clothing catalog model exposed by the backend API."
        action={
          config && (
            <Badge variant="outline" className="text-sm">
              Active: {config.label}
            </Badge>
          )
        }
      />

      {loading && <LoadingState variant="page" />}
      {error && <ErrorState message={error} onRetry={refetch} />}

      {!loading && !error && config && (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Current Configuration
              </CardTitle>
              <CardDescription>
                Product and variant settings currently used by the 1990 storefront.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between rounded-lg border p-3">
                <span className="text-muted-foreground">Product Type</span>
                <span className="font-medium capitalize">{config.productType}</span>
              </div>
              <div className="flex justify-between rounded-lg border p-3">
                <span className="text-muted-foreground">Variant Label</span>
                <span className="font-medium">{config.variantLabel}</span>
              </div>
              <div className="flex justify-between rounded-lg border p-3">
                <span className="text-muted-foreground">Default Sizes</span>
                <span className="font-medium">{config.variantPresets.join(", ")}</span>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground">Homepage Sections</p>
                <p className="mt-1 font-medium">{config.homeSections.join(" → ")}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden bg-primary text-primary-foreground">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <Shirt className="h-6 w-6" />
              </div>
              <CardTitle className="font-serif text-2xl">1990 Clothing</CardTitle>
              <CardDescription className="text-primary-foreground/65">
                Made For Originals. This standalone dashboard reads configuration through
                the existing platform API and never accesses backend storage directly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-primary-foreground/70">
                Catalog data remains controlled by Products, Categories, and Inventory.
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
