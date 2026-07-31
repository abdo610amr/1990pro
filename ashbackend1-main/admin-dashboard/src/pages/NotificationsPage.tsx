import { useEffect, useState } from "react";
import { Save, Bell, Plus, Trash2, Send, Mail } from "lucide-react";
import { toast } from "sonner";
import { notificationService } from "@/services/notifications";
import { getErrorMessage } from "@/services/api";
import { useAsyncData } from "@/hooks/useAsyncData";
import type {
  NotificationProvider,
  NotificationSettings,
} from "@/types/notification";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PROVIDERS: { value: NotificationProvider; label: string; ready: boolean }[] = [
  { value: "resend", label: "Resend", ready: true },
  { value: "brevo", label: "Brevo (coming soon)", ready: false },
  { value: "mailgun", label: "Mailgun (coming soon)", ready: false },
  { value: "ses", label: "Amazon SES (coming soon)", ready: false },
];

export function NotificationsPage() {
  const { data, loading, error, refetch } = useAsyncData(
    notificationService.getSettings
  );

  const [enabled, setEnabled] = useState(false);
  const [provider, setProvider] = useState<NotificationProvider>("resend");
  const [emails, setEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (!data) return;
    setEnabled(data.enabled);
    setProvider(data.provider);
    setEmails(data.emails ?? []);
  }, [data]);

  const addEmail = () => {
    const email = newEmail.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      toast.error("Enter a valid email address");
      return;
    }
    if (emails.includes(email)) {
      toast.error("That email is already in the list");
      return;
    }
    setEmails((prev) => [...prev, email]);
    setNewEmail("");
  };

  const removeEmail = (email: string) => {
    setEmails((prev) => prev.filter((e) => e !== email));
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload: NotificationSettings = { enabled, provider, emails };
      const updated = await notificationService.updateSettings(payload);
      setEmails(updated.emails);
      toast.success("Notification settings saved");
      await refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const sendTest = async () => {
    if (!emails.length) {
      toast.error("Add at least one recipient email first");
      return;
    }
    setTesting(true);
    try {
      const res = await notificationService.sendTest();
      toast.success(res.message ?? "Test email sent");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Send email alerts for new orders, low stock, out of stock, and order status changes."
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

      {!loading && !error && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>
                Configure the email provider and toggle notifications on or off.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label htmlFor="notif-enabled">Enable Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    When off, no emails are sent (you can still send a test email).
                  </p>
                </div>
                <Switch
                  id="notif-enabled"
                  checked={enabled}
                  onCheckedChange={setEnabled}
                />
              </div>

              <div className="space-y-2">
                <Label>Provider</Label>
                <Select
                  value={provider}
                  onValueChange={(v) => setProvider(v as NotificationProvider)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDERS.map((p) => (
                      <SelectItem key={p.value} value={p.value} disabled={!p.ready}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  The Resend API key is read from{" "}
                  <code className="rounded bg-muted px-1">RESEND_API_KEY</code> on the
                  server — never stored in the browser.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recipient Emails</CardTitle>
              <CardDescription>
                Every alert is sent to all addresses below. Add as many as you need.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={newEmail}
                  placeholder="owner@brand.com"
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addEmail();
                    }
                  }}
                />
                <Button type="button" variant="secondary" onClick={addEmail}>
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>

              {emails.length === 0 ? (
                <div className="flex items-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  No recipient emails yet.
                </div>
              ) : (
                <ul className="space-y-2">
                  {emails.map((email) => (
                    <li
                      key={email}
                      className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                    >
                      <span className="truncate">{email}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEmail(email)}
                        aria-label={`Remove ${email}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3 lg:col-span-2">
            <Button onClick={save} disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              variant="outline"
              onClick={sendTest}
              disabled={testing || !emails.length}
            >
              <Send className="h-4 w-4" />
              {testing ? "Sending..." : "Send Test Email"}
            </Button>
          </div>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                What triggers an email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                <li>🛒 New order placed</li>
                <li>📦 Stock reaches the low-stock threshold</li>
                <li>🚫 Stock reaches zero (out of stock)</li>
                <li>🔄 Order status changes</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
