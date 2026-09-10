"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type PromoType = "percentage" | "fixed" | "bogo" | "bundle";

export interface PromoFormValues {
  code: string;
  active: boolean;
  start_date: string;
  end_date: string;
  usage_limit: number | "";
  min_order: number;
  type: PromoType;
  discount_value: number;
  bundle_buy: string;
  bundle_get: string;
  buy_qty: number;
  get_qty: number;
}

const defaultForm = (): PromoFormValues => ({
  code: "",
  active: true,
  start_date: "",
  end_date: "",
  usage_limit: "",
  min_order: 0,
  type: "percentage",
  discount_value: 10,
  bundle_buy: "",
  bundle_get: "",
  buy_qty: 1,
  get_qty: 1,
});

interface PromoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (form: PromoFormValues) => Promise<void>;
  submitting: boolean;
}

export function PromoFormDialog({
  open,
  onOpenChange,
  onSubmit,
  submitting,
}: PromoFormDialogProps) {
  const [form, setForm] = useState<PromoFormValues>(defaultForm);

  const update = <K extends keyof PromoFormValues>(
    key: K,
    value: PromoFormValues[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
    setForm(defaultForm());
  };

  const showBogoFields = form.type === "bogo" || form.type === "bundle";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Coupon</DialogTitle>
          <DialogDescription>
            Set up a promotional code with discount rules.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody className="max-h-[60vh] space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Promo Code</Label>
              <Input
                id="code"
                value={form.code}
                onChange={(e) => update("code", e.target.value)}
                placeholder="SUMMER20"
                required
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border px-3 py-3">
              <Label htmlFor="active">Active</Label>
              <Switch
                id="active"
                checked={form.active}
                onCheckedChange={(checked) => update("active", checked)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={form.start_date}
                  onChange={(e) => update("start_date", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={form.end_date}
                  onChange={(e) => update("end_date", e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="usage_limit">Usage Limit</Label>
                <Input
                  id="usage_limit"
                  type="number"
                  min={1}
                  placeholder="Unlimited"
                  value={form.usage_limit}
                  onChange={(e) =>
                    update(
                      "usage_limit",
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_order">Min Order</Label>
                <Input
                  id="min_order"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.min_order}
                  onChange={(e) => update("min_order", Number(e.target.value))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="promo-type">Discount Type</Label>
              <Select
                id="promo-type"
                value={form.type}
                onChange={(e) => update("type", e.target.value as PromoType)}
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
                <option value="bogo">Buy One Get One</option>
                <option value="bundle">Bundle</option>
              </Select>
            </div>
            {(form.type === "percentage" || form.type === "fixed") && (
              <div className="space-y-2">
                <Label htmlFor="discount_value">
                  {form.type === "percentage"
                    ? "Discount (%)"
                    : "Discount amount"}
                </Label>
                <Input
                  id="discount_value"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.discount_value}
                  onChange={(e) =>
                    update("discount_value", Number(e.target.value))
                  }
                />
              </div>
            )}
            {showBogoFields && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bundle_buy">Buy Size</Label>
                  <Input
                    id="bundle_buy"
                    value={form.bundle_buy}
                    onChange={(e) => update("bundle_buy", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bundle_get">Get Size</Label>
                  <Input
                    id="bundle_get"
                    value={form.bundle_get}
                    onChange={(e) => update("bundle_get", e.target.value)}
                  />
                </div>
                {form.type === "bogo" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="buy_qty">Buy Qty</Label>
                      <Input
                        id="buy_qty"
                        type="number"
                        min={1}
                        value={form.buy_qty}
                        onChange={(e) =>
                          update("buy_qty", Number(e.target.value))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="get_qty">Get Qty</Label>
                      <Input
                        id="get_qty"
                        type="number"
                        min={1}
                        value={form.get_qty}
                        onChange={(e) =>
                          update("get_qty", Number(e.target.value))
                        }
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create Coupon"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
