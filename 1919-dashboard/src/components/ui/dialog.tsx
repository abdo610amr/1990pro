"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialogContext() {
  const ctx = React.useContext(DialogContext);
  if (!ctx) throw new Error("Dialog components must be used within <Dialog>");
  return ctx;
}

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ open, onOpenChange, children, className }: DialogProps) {
  const ref = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (open && !node.open) node.showModal();
    if (!open && node.open) node.close();
  }, [open]);

  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      <dialog
        ref={ref}
        className={cn(
          "fixed inset-0 z-50 m-auto max-h-[92vh] w-[min(100%-1rem,40rem)] overflow-hidden rounded-2xl border border-border bg-card p-0 text-card-foreground shadow-2xl open:flex open:flex-col backdrop:bg-black/45",
          className
        )}
        onClose={() => onOpenChange(false)}
        onClick={(event) => {
          if (event.target === ref.current) onOpenChange(false);
        }}
      >
        {open ? children : null}
      </dialog>
    </DialogContext.Provider>
  );
}

export function DialogContent({
  className,
  children,
  showClose = true,
}: {
  className?: string;
  children: React.ReactNode;
  showClose?: boolean;
}) {
  const { onOpenChange } = useDialogContext();
  return (
    <div className={cn("relative flex max-h-[90vh] flex-col", className)}>
      {showClose && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3 z-10 h-9 w-9"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      {children}
    </div>
  );
}

export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-1.5 border-b border-border/70 px-5 py-4 pr-12", className)}
      {...props}
    />
  );
}

export function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("font-heading text-xl font-medium tracking-tight", className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  );
}

export function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 border-t border-border/70 px-5 py-4 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  );
}

export function DialogBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("overflow-y-auto px-5 py-4", className)} {...props} />
  );
}
