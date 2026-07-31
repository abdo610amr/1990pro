import { Check, Printer } from "lucide-react";
import type { Order } from "@/types/order";
import { normalizeOrderStatus, ORDER_STATUS_OPTIONS } from "@/types/order";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface OrderDetailsDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailsDialog({
  order,
  open,
  onOpenChange,
}: OrderDetailsDialogProps) {
  if (!order) return null;
  const normalizedStatus = normalizeOrderStatus(order.status);
  const currentStatusIndex = ORDER_STATUS_OPTIONS.findIndex(
    (status) => status.value === normalizedStatus
  );
  const timeline = ORDER_STATUS_OPTIONS.filter((status) => status.value !== "cancelled");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="flex-row items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              Order details
            </p>
            <DialogTitle className="font-serif text-2xl">Order #{order.id}</DialogTitle>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Invoice
          </Button>
        </DialogHeader>

        <div className="rounded-2xl border bg-secondary/25 p-4">
          {normalizedStatus === "cancelled" ? (
            <Badge variant="destructive">Order cancelled</Badge>
          ) : (
            <div className="grid grid-cols-5">
              {timeline.map((status, index) => {
                const complete = index <= currentStatusIndex;
                return (
                  <div key={status.value} className="relative flex flex-col items-center gap-2 text-center">
                    {index < timeline.length - 1 && (
                      <span
                        className={`absolute left-1/2 top-3 h-0.5 w-full ${
                          index < currentStatusIndex ? "bg-primary" : "bg-border"
                        }`}
                      />
                    )}
                    <span
                      className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border ${
                        complete
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-muted-foreground"
                      }`}
                    >
                      {complete ? <Check className="h-3.5 w-3.5" /> : index + 1}
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {status.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid gap-4 rounded-2xl border p-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Customer</p>
            <p className="font-medium">{order.customerName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <Badge className="capitalize">{order.status}</Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p>{order.email}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Phone</p>
            <p>{order.phone}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-muted-foreground">Address</p>
            <p>{order.address || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Payment Method</p>
            <Badge variant="outline" className="capitalize">{order.payment_method || "cash"}</Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Promo</p>
            <p>
              {order.promoCode
                ? `${order.promoCode} (${order.promoType})`
                : "—"}
            </p>
          </div>
        </div>

        <Separator />

        <div>
          <p className="mb-2 text-sm font-medium">Line Items</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item, i) => (
                <TableRow key={i}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.size}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(Number(item.price))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-between rounded-lg bg-muted p-4 text-sm">
          <div>
            {order.discount > 0 && (
              <p className="text-emerald-600">
                Discount: -{formatCurrency(Number(order.discount))}
              </p>
            )}
          </div>
          <p className="text-lg font-bold">
            Total: {formatCurrency(Number(order.totalPrice))}
          </p>
        </div>

        {order.paymentScreenshot && (
          <div>
            <p className="mb-2 text-sm font-medium">Payment Screenshot</p>
            <a
              href={order.paymentScreenshot}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <img
                src={order.paymentScreenshot}
                alt="Payment proof"
                className="max-h-48 rounded-lg border object-contain"
              />
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
