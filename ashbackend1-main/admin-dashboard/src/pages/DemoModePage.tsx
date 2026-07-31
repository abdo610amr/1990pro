import { useState } from "react";
import { FlaskConical, Shirt, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { platformService } from "@/services/platform";
import { usePlatformConfig } from "@/hooks/usePlatformConfig";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function DemoModePage() {
  const { config, loading, error, refetch } = usePlatformConfig();
  const [submitting, setSubmitting] = useState<"fashion" | "perfume" | null>(null);

  const activateDemo = async (mode: "fashion" | "perfume") => {
    setSubmitting(mode);
    try {
      const result =
        mode === "fashion"
          ? await platformService.seedFashionDemo()
          : await platformService.seedPerfumeDemo();
      toast.success(result.message);
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load demo");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Demo Mode"
        description="Switch the platform between Perfume and Fashion testing modes using configuration and demo data."
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
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Current Configuration
              </CardTitle>
              <CardDescription>
                Product Type Engine settings loaded from <code>data/platform.json</code>
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

          <Card>
            <CardHeader>
              <CardTitle>Load Demo Experience</CardTitle>
              <CardDescription>
                Seeds categories and products for the selected mode. Uses the same backend,
                dashboard, and storefront.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Shirt className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Fashion Demo</p>
                    <p className="text-xs text-muted-foreground">
                      6 categories, 22 products, Size variants (S–XXL)
                    </p>
                  </div>
                </div>
                <Button
                  className="w-full"
                  disabled={submitting !== null}
                  onClick={() => activateDemo("fashion")}
                >
                  {submitting === "fashion" ? "Loading..." : "Activate Fashion Demo"}
                </Button>
              </div>

              <div className="rounded-xl border p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FlaskConical className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Perfume Demo</p>
                    <p className="text-xs text-muted-foreground">
                      4 categories, 5 products, Volume variants (30ml–100ml)
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={submitting !== null}
                  onClick={() => activateDemo("perfume")}
                >
                  {submitting === "perfume" ? "Loading..." : "Activate Perfume Demo"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
