import type { Order } from "@/types/order";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Order #{order.id}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Customer</p>
            <p className="font-medium">{order.customerName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <Badge>{order.status}</Badge>
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
            <p className="capitalize">{order.payment_method}</p>
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
