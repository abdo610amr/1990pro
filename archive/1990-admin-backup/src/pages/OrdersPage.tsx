import { useMemo, useState } from "react";
import { ShoppingCart, Eye, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { orderService } from "@/services/orders";
import { useAsyncData } from "@/hooks/useAsyncData";
import type { Order, OrderStatus } from "@/types/order";
import { ORDER_STATUS_OPTIONS, normalizeOrderStatus } from "@/types/order";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { OrderDetailsDialog } from "@/components/orders/OrderDetailsDialog";
import { formatCurrency } from "@/lib/utils";

const STATUS_OPTIONS: OrderStatus[] = ORDER_STATUS_OPTIONS.map((s) => s.value);

export function OrdersPage() {
  const { data: orders, loading, error, refetch } = useAsyncData(
    orderService.getAll
  );
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return (orders ?? []).filter((order) => {
      const matchesQuery =
        !normalizedQuery ||
        String(order.id).includes(normalizedQuery) ||
        order.customerName.toLowerCase().includes(normalizedQuery) ||
        order.email.toLowerCase().includes(normalizedQuery);
      const matchesStatus =
        statusFilter === "all" || normalizeOrderStatus(order.status) === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [orders, query, statusFilter]);

  const handleStatusChange = async (id: number, status: OrderStatus) => {
    setUpdatingId(id);
    try {
      await orderService.updateStatus(id, status);
      toast.success("Order status updated");
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSubmitting(true);
    try {
      await orderService.remove(deleteId);
      toast.success("Order deleted");
      setDeleteId(null);
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="View and manage customer orders, payment proofs, and statuses."
      />

      {!loading && !error && orders && orders.length > 0 && (
        <Card>
          <CardContent className="flex flex-col gap-3 p-3 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search order, customer or email…"
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? "all")}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {ORDER_STATUS_OPTIONS.find((item) => item.value === status)?.label ?? status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card>
          <CardContent className="p-0">
            <LoadingState rows={8} />
          </CardContent>
        </Card>
      )}

      {error && <ErrorState message={error} onRetry={refetch} />}

      {!loading && !error && orders?.length === 0 && (
        <EmptyState
          icon={ShoppingCart}
          title="No orders yet"
          description="Orders placed by customers will appear here."
        />
      )}

      {!loading && !error && orders && orders.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{order.items?.length ?? 0}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {formatCurrency(Number(order.totalPrice))}
                        </p>
                        <Badge variant="outline" className="mt-1 capitalize">
                          {order.payment_method || "cash"}
                        </Badge>
                        {order.discount > 0 && (
                          <p className="text-xs text-emerald-600">
                            -{formatCurrency(Number(order.discount))} promo
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={normalizeOrderStatus(order.status)}
                        onValueChange={(value) =>
                          handleStatusChange(order.id, value as OrderStatus)
                        }
                        disabled={updatingId === order.id}
                      >
                        <SelectTrigger className="w-36 capitalize">
                          <SelectValue placeholder={order.status} />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status} value={status} className="capitalize">
                              {ORDER_STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewOrder(order)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteId(order.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredOrders.length === 0 && (
              <div className="p-10 text-center text-sm text-muted-foreground">
                No orders match the current filters.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <OrderDetailsDialog
        order={viewOrder}
        open={!!viewOrder}
        onOpenChange={(open) => !open && setViewOrder(null)}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete order?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the order and all its line items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={submitting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
