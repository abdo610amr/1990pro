import { Check, Package, Truck, XCircle } from "lucide-react";
import type { Order } from "@/types/order";
import {
  TRACKING_STEPS,
  getStatusLabel,
  getTrackingStepIndex,
  normalizeOrderStatus,
} from "@/lib/orderStatus";
import { cn } from "@/lib/utils";

interface OrderTrackerProps {
  order: Order;
  className?: string;
}

export function OrderTracker({ order, className }: OrderTrackerProps) {
  const normalized = normalizeOrderStatus(order.status);
  const isCancelled = normalized === "cancelled";
  const currentStep = getTrackingStepIndex(order.status);

  if (isCancelled) {
    return (
      <div
        className={cn(
          "flex flex-col items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center",
          className
        )}
      >
        <XCircle className="h-12 w-12 text-destructive" />
        <h3 className="font-display text-xl font-semibold">Order Cancelled</h3>
        <p className="text-sm text-muted-foreground">
          Order #{order.id} has been cancelled.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-6 md:p-8", className)}>
      <div className="mb-6 text-center">
        <p className="text-sm text-muted-foreground">Current Status</p>
        <h3 className="font-display text-2xl font-semibold">{getStatusLabel(order.status)}</h3>
      </div>

      <div className="relative">
        <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-border md:left-1/2 md:-translate-x-px" />
        <div
          className="absolute left-5 top-5 w-0.5 bg-primary transition-all duration-500 md:left-1/2 md:-translate-x-px"
          style={{ height: `${(currentStep / (TRACKING_STEPS.length - 1)) * 100}%` }}
        />

        <ul className="space-y-6">
          {TRACKING_STEPS.map((step, index) => {
            const isComplete = index <= currentStep;
            const isCurrent = index === currentStep;
            const Icon = index === 0 ? Package : index === TRACKING_STEPS.length - 1 ? Check : Truck;

            return (
              <li
                key={step.key}
                className={cn(
                  "relative flex items-center gap-4 md:gap-0",
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                )}
              >
                <div className="hidden flex-1 md:block">
                  {index % 2 === 0 && (
                    <div className="pr-8 text-right">
                      <p
                        className={cn(
                          "font-medium",
                          isComplete ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {step.label}
                      </p>
                    </div>
                  )}
                </div>

                <div
                  className={cn(
                    "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition",
                    isComplete
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground",
                    isCurrent && "ring-4 ring-primary/20"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="flex-1 md:hidden">
                  <p
                    className={cn(
                      "font-medium",
                      isComplete ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </p>
                </div>

                <div className="hidden flex-1 md:block">
                  {index % 2 !== 0 && (
                    <div className="pl-8 text-left">
                      <p
                        className={cn(
                          "font-medium",
                          isComplete ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {step.label}
                      </p>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
