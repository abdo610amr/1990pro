import { useMemo, useState } from "react";
import { Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { reviewService } from "@/services/reviews";
import { productService } from "@/services/products";
import { useAsyncData } from "@/hooks/useAsyncData";
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

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < rating
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

export function ReviewsPage() {
  const {
    data: reviews,
    loading: reviewsLoading,
    error: reviewsError,
    refetch: refetchReviews,
  } = useAsyncData(reviewService.getAll);

  const { data: products } = useAsyncData(productService.getAll);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const productMap = useMemo(() => {
    const map = new Map<number, string>();
    products?.forEach((p) => map.set(p.id, p.name));
    return map;
  }, [products]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setSubmitting(true);
    try {
      await reviewService.remove(deleteId);
      toast.success("Review deleted");
      setDeleteId(null);
      await refetchReviews();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete review");
    } finally {
      setSubmitting(false);
    }
  };

  const loading = reviewsLoading;
  const error = reviewsError;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reviews"
        description="Moderate customer reviews and ratings for your products."
      />

      {loading && (
        <Card>
          <CardContent className="p-0">
            <LoadingState rows={6} />
          </CardContent>
        </Card>
      )}

      {error && <ErrorState message={error} onRetry={refetchReviews} />}

      {!loading && !error && reviews?.length === 0 && (
        <EmptyState
          icon={Star}
          title="No reviews yet"
          description="Customer reviews will appear here once submitted."
        />
      )}

      {!loading && !error && reviews && reviews.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium">{review.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {productMap.get(review.product_id) ??
                          `Product #${review.product_id}`}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StarRating rating={review.rating} />
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {review.comment || "—"}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteId(review.id)}
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

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete review?</AlertDialogTitle>
            <AlertDialogDescription>
              This review will be permanently removed from the product page.
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
