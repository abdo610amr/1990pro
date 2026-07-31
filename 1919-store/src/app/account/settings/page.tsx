"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Bell, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useState } from "react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [marketing, setMarketing] = useState(false);

  const handleSave = () => {
    toast.success("Settings saved");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border p-8">
        <div className="flex items-center gap-3">
          <Sun className="h-5 w-5" />
          <div>
            <h2 className="font-heading text-xl font-light">Appearance</h2>
            <p className="text-sm text-muted-foreground">
              Customize how 1990 looks on your device.
            </p>
          </div>
        </div>
        <Separator className="my-6" />
        <div className="flex items-center justify-between">
          <div>
            <Label>Theme</Label>
            <p className="text-sm text-muted-foreground">
              {theme === "dark" ? "Dark mode" : "Light mode"}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <>
                <Sun className="mr-2 h-4 w-4" /> Light
              </>
            ) : (
              <>
                <Moon className="mr-2 h-4 w-4" /> Dark
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border p-8">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5" />
          <div>
            <h2 className="font-heading text-xl font-light">Notifications</h2>
            <p className="text-sm text-muted-foreground">
              Manage how we communicate with you.
            </p>
          </div>
        </div>
        <Separator className="my-6" />
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive account-related emails
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Order Updates</Label>
              <p className="text-sm text-muted-foreground">
                Shipping and delivery notifications
              </p>
            </div>
            <Switch checked={orderUpdates} onCheckedChange={setOrderUpdates} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Marketing</Label>
              <p className="text-sm text-muted-foreground">
                New collections and exclusive offers
              </p>
            </div>
            <Switch checked={marketing} onCheckedChange={setMarketing} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border p-8">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5" />
          <div>
            <h2 className="font-heading text-xl font-light">Security</h2>
            <p className="text-sm text-muted-foreground">
              Keep your account secure.
            </p>
          </div>
        </div>
        <Separator className="my-6" />
        <Button variant="outline" className="rounded-full">
          Change Password
        </Button>
      </div>

      <Button onClick={handleSave} className="rounded-full px-8">
        Save Settings
      </Button>
    </div>
  );
}
