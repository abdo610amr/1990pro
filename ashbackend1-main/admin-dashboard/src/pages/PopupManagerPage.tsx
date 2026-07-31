import { useEffect, useState } from "react";
import { Save, ImageIcon, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { popupService } from "@/services/popup";
import { useAsyncData } from "@/hooks/useAsyncData";
import type { PopupFormData } from "@/types/popup";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const emptyForm: PopupFormData = {
  enabled: false,
  title: "",
  description: "",
  image: "",
  buttonText: "",
  buttonUrl: "",
  showOnce: true,
  showEveryVisit: false,
};

export function PopupManagerPage() {
  const { data, loading, error, refetch } = useAsyncData(popupService.get);
  const [form, setForm] = useState<PopupFormData>(emptyForm);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({ ...data });
      setImagePreview(data.image ?? "");
    }
  }, [data]);

  const updateField = <K extends keyof PopupFormData>(
    key: K,
    value: PopupFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageChange = (file: File | undefined) => {
    if (!file) return;
    updateField("imageFile", file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleShowOnceChange = (checked: boolean) => {
    updateField("showOnce", checked);
    if (checked) updateField("showEveryVisit", false);
  };

  const handleShowEveryVisitChange = (checked: boolean) => {
    updateField("showEveryVisit", checked);
    if (checked) updateField("showOnce", false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await popupService.update(form);
      toast.success("Popup settings saved");
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save popup");
    } finally {
      setSubmitting(false);
    }
  };

  const isEmpty =
    !form.enabled &&
    !form.title &&
    !form.description &&
    !form.image &&
    !form.buttonText;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Popup Manager"
        description="Configure the homepage popup shown to storefront visitors."
        action={
          data && (
            <Badge variant={data.enabled ? "default" : "secondary"}>
              {data.enabled ? "Enabled" : "Disabled"}
            </Badge>
          )
        }
      />

      {loading && <LoadingState variant="page" />}

      {error && <ErrorState message={error} onRetry={refetch} />}

      {!loading && !error && isEmpty && (
        <EmptyState
          icon={Megaphone}
          title="No popup configured"
          description="Enable the popup and add a title to start engaging homepage visitors."
        />
      )}

      {!loading && !error && (
        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Popup Settings</CardTitle>
              <CardDescription>
                Control visibility and content for the homepage popup.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label htmlFor="popup-enabled">Enabled</Label>
                  <p className="text-xs text-muted-foreground">
                    Show popup on the storefront homepage
                  </p>
                </div>
                <Switch
                  id="popup-enabled"
                  checked={form.enabled}
                  onCheckedChange={(v) => updateField("enabled", v)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="popup-title">Title</Label>
                <Input
                  id="popup-title"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Summer Sale"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="popup-description">Description</Label>
                <Textarea
                  id="popup-description"
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={3}
                  placeholder="Get 20% off your first order"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="popup-image">Image URL</Label>
                <Input
                  id="popup-image"
                  value={form.image}
                  onChange={(e) => {
                    updateField("image", e.target.value);
                    setImagePreview(e.target.value);
                  }}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="popup-image-file">Upload Image</Label>
                <Input
                  id="popup-image-file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e.target.files?.[0])}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="popup-button-text">Button Text</Label>
                  <Input
                    id="popup-button-text"
                    value={form.buttonText}
                    onChange={(e) => updateField("buttonText", e.target.value)}
                    placeholder="Shop Now"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="popup-button-url">Button URL</Label>
                  <Input
                    id="popup-button-url"
                    value={form.buttonUrl}
                    onChange={(e) => updateField("buttonUrl", e.target.value)}
                    placeholder="/shop"
                  />
                </div>
              </div>

              <div className="space-y-3 rounded-lg border p-4">
                <p className="text-sm font-medium">Display Frequency</p>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="popup-show-once">Show Once</Label>
                    <p className="text-xs text-muted-foreground">
                      Dismiss permanently after first close
                    </p>
                  </div>
                  <Switch
                    id="popup-show-once"
                    checked={form.showOnce}
                    onCheckedChange={handleShowOnceChange}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="popup-show-every">Show Every Visit</Label>
                    <p className="text-xs text-muted-foreground">
                      Show again on each new browser session
                    </p>
                  </div>
                  <Switch
                    id="popup-show-every"
                    checked={form.showEveryVisit}
                    onCheckedChange={handleShowEveryVisitChange}
                  />
                </div>
              </div>

              <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                <Save className="h-4 w-4" />
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>How the popup will appear on the homepage.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-hidden rounded-xl border bg-muted/30 p-6">
                <div className="mx-auto max-w-sm rounded-2xl border bg-background p-6 shadow-lg">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Popup preview"
                      className="mb-4 aspect-video w-full rounded-lg object-cover"
                    />
                  ) : (
                    <div className="mb-4 flex aspect-video w-full items-center justify-center rounded-lg bg-muted">
                      <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  <h3 className="font-display text-xl font-bold">
                    {form.title || "Popup Title"}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {form.description || "Popup description will appear here."}
                  </p>
                  {form.buttonText && (
                    <Button type="button" className="mt-4 w-full" disabled>
                      {form.buttonText}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
}
