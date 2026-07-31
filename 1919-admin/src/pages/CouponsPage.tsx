import { useState } from "react";
import { Plus, Trash2, Ticket } from "lucide-react";
import { toast } from "sonner";
import { promoService } from "@/services/promos";
import { useAsyncData } from "@/hooks/useAsyncData";
import type { Promo, PromoFormData } from "@/types/promo";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { PromoFormDialog } from "@/components/coupons/PromoFormDialog";
import { formatDate } from "@/lib/utils";

function isPromoActive(promo: Promo) {
  const active = Boolean(promo.active);
  const now = new Date();
  const started = !promo.start_date || now >= new Date(promo.start_date);
  const notExpired = !promo.end_date || now <= new Date(promo.end_date);
  const underLimit =
    !promo.usage_limit || promo.used_count < promo.usage_limit;
  return active && started && notExpired && underLimit;
}

export function CouponsPage() {
  const { data: promos, loading, error, refetch } = useAsyncData(
    promoService.getAll
  );
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (form: PromoFormData) => {
    setSubmitting(true);
    try {
      await promoService.create(form);
      toast.success("Coupon created successfully");
      setFormOpen(false);
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create coupon");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSubmitting(true);
    try {
      await promoService.remove(deleteId);
      toast.success("Coupon deleted");
      setDeleteId(null);
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete coupon");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coupons"
        description="Create and manage promotional codes and discount rules."
        action={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Coupon
          </Button>
        }
      />

      {loading && (
        <Card>
          <CardContent className="p-0">
            <LoadingState rows={6} />
          </CardContent>
        </Card>
      )}

      {error && <ErrorState message={error} onRetry={refetch} />}

      {!loading && !error && promos?.length === 0 && (
        <EmptyState
          icon={Ticket}
          title="No coupons yet"
          description="Create promotional codes to offer discounts to customers."
          action={
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Coupon
            </Button>
          }
        />
      )}

      {!loading && !error && promos && promos.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Valid Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promos.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell className="font-mono font-medium uppercase">
                      {promo.code}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{promo.type}</Badge>
                    </TableCell>
                    <TableCell>
                      {promo.type === "percentage"
                        ? `${promo.discount_value}%`
                        : promo.type === "fixed"
                          ? `$${promo.discount_value}`
                          : promo.type === "bogo"
                            ? `Buy ${promo.buy_qty} ${promo.bundle_buy} → Get ${promo.get_qty} ${promo.bundle_get}`
                            : `${promo.bundle_buy} + ${promo.bundle_get}`}
                    </TableCell>
                    <TableCell>
                      {promo.used_count}
                      {promo.usage_limit ? ` / ${promo.usage_limit}` : " / ∞"}
                    </TableCell>
                    <TableCell className="text-xs">
                      <p>{formatDate(promo.start_date)}</p>
                      <p className="text-muted-foreground">
                        → {formatDate(promo.end_date)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isPromoActive(promo) ? "success" : "secondary"}>
                        {isPromoActive(promo) ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteId(promo.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <PromoFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        submitting={submitting}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete coupon?</AlertDialogTitle>
            <AlertDialogDescription>
              Customers will no longer be able to use this promo code.
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
