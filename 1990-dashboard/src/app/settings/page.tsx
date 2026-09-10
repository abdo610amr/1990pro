"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Settings, Bell, Store, Shield, Send } from "lucide-react";
import { posApi } from "@/lib/api";
import { ErpPageHeader } from "@/components/erp/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminSettingsPage() {
  const { data: notifySettings, refetch: refetchNotify } = useQuery({
    queryKey: ["admin-notify-settings"],
    queryFn: posApi.getNotificationSettings,
  });

  const { data: platformSettings, refetch: refetchPlatform } = useQuery({
    queryKey: ["admin-platform-settings"],
    queryFn: posApi.getPlatform,
  });

  const [emails, setEmails] = useState("");
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [productType, setProductType] = useState("fashion");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (notifySettings) {
      setEmails(notifySettings.emails?.join(", ") ?? "");
      setNotifyEnabled(notifySettings.enabled ?? true);
    }
  }, [notifySettings]);

  useEffect(() => {
    if (platformSettings) {
      setProductType(platformSettings.productType || "fashion");
    }
  }, [platformSettings]);

  const handleSaveNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const emailList = emails
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      await posApi.updateNotificationSettings({
        enabled: notifyEnabled,
        provider: "resend",
        emails: emailList,
      });
      toast.success("Notification settings saved");
      await refetchNotify();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const handleSendTest = async () => {
    try {
      await posApi.sendTestNotification();
      toast.success("Test notification email sent");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Test dispatch failed");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <ErpPageHeader
        eyebrow="System Configuration"
        title="Admin Settings"
        description="Configure store settings, email notification triggers, and platform options."
      />

      <Card className="shadow-sm border-border/80">
        <CardHeader>
          <CardTitle className="font-heading text-lg flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" /> Email & Order Notification Triggers
          </CardTitle>
          <CardDescription>Configure admin notification recipients for website & store orders.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSaveNotify} className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="notifyEnabled"
                checked={notifyEnabled}
                onChange={(e) => setNotifyEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="notifyEnabled" className="text-sm font-semibold cursor-pointer">
                Enable Automatic Order Email Notifications
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Admin Recipient Emails (comma separated)</label>
              <Input value={emails} onChange={(e) => setEmails(e.target.value)} placeholder="admin@1990.store, orders@1990.store" />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button type="button" variant="outline" onClick={handleSendTest} className="gap-2">
                <Send className="h-4 w-4" /> Send Test Email
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? "Saving…" : "Save Notification Settings"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border/80">
        <CardHeader>
          <CardTitle className="font-heading text-lg flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" /> Store Information & Platform Type
          </CardTitle>
          <CardDescription>Active platform rules and taxonomy modes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-secondary/30 rounded-xl border">
              <p className="font-semibold text-muted-foreground uppercase text-[10px]">Product Mode</p>
              <p className="font-bold text-sm text-foreground mt-0.5">{platformSettings?.label || "Apparel / Fashion"}</p>
            </div>
            <div className="p-3 bg-secondary/30 rounded-xl border">
              <p className="font-semibold text-muted-foreground uppercase text-[10px]">Variant Attribute</p>
              <p className="font-bold text-sm text-foreground mt-0.5">{platformSettings?.variantLabel || "Size"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
