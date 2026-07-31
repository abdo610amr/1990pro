import { useEffect, useState } from "react";
import { Save, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { announcementService } from "@/services/announcement";
import { useAsyncData } from "@/hooks/useAsyncData";
import type { AnnouncementFormData } from "@/types/announcement";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const emptyForm: AnnouncementFormData = {
  enabled: false,
  text: "",
  link: "",
  backgroundColor: "#1a1a2e",
  textColor: "#ffffff",
};

export function AnnouncementBarPage() {
  const { data, loading, error, refetch } = useAsyncData(announcementService.get);
  const [form, setForm] = useState<AnnouncementFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (data) setForm({ ...data });
  }, [data]);

  const updateField = <K extends keyof AnnouncementFormData>(
    key: K,
    value: AnnouncementFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await announcementService.update(form);
      toast.success("Announcement bar saved");
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save announcement");
    } finally {
      setSubmitting(false);
    }
  };

  const isEmpty = !form.enabled && !form.text;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcement Bar"
        description="Display a global announcement banner across all storefront pages."
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
          title="No announcement configured"
          description="Enable the bar and add text to display a site-wide message."
        />
      )}

      {!loading && !error && (
        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Bar Settings</CardTitle>
              <CardDescription>
                Customize the announcement shown at the top of every page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label htmlFor="announcement-enabled">Enabled</Label>
                  <p className="text-xs text-muted-foreground">
                    Show announcement bar on all storefront pages
                  </p>
                </div>
                <Switch
                  id="announcement-enabled"
                  checked={form.enabled}
                  onCheckedChange={(v) => updateField("enabled", v)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="announcement-text">Text</Label>
                <Input
                  id="announcement-text"
                  value={form.text}
                  onChange={(e) => updateField("text", e.target.value)}
                  placeholder="Free shipping on orders over $50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="announcement-link">Link</Label>
                <Input
                  id="announcement-link"
                  value={form.link}
                  onChange={(e) => updateField("link", e.target.value)}
                  placeholder="/shop"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="announcement-bg">Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="announcement-bg"
                      type="color"
                      value={form.backgroundColor}
                      onChange={(e) => updateField("backgroundColor", e.target.value)}
                      className="h-10 w-14 cursor-pointer p-1"
                    />
                    <Input
                      value={form.backgroundColor}
                      onChange={(e) => updateField("backgroundColor", e.target.value)}
                      placeholder="#1a1a2e"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="announcement-text-color">Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="announcement-text-color"
                      type="color"
                      value={form.textColor}
                      onChange={(e) => updateField("textColor", e.target.value)}
                      className="h-10 w-14 cursor-pointer p-1"
                    />
                    <Input
                      value={form.textColor}
                      onChange={(e) => updateField("textColor", e.target.value)}
                      placeholder="#ffffff"
                    />
                  </div>
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
              <CardDescription>Live preview of the announcement bar styling.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-xl border">
                <div
                  className="px-4 py-3 text-center text-sm font-medium"
                  style={{
                    backgroundColor: form.backgroundColor,
                    color: form.textColor,
                  }}
                >
                  {form.link ? (
                    <span className="underline underline-offset-2">
                      {form.text || "Announcement text will appear here"}
                    </span>
                  ) : (
                    form.text || "Announcement text will appear here"
                  )}
                </div>
                <div className="bg-muted/30 p-4 text-center text-xs text-muted-foreground">
                  Storefront page content below
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
}
