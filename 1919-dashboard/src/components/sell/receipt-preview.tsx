"use client";

import { SITE_ESTABLISHED, SITE_MARK, SITE_NAME, SITE_SLOGAN } from "@/lib/constants";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { PosCartItem } from "@/types/pos";

export function ReceiptPreview({
  orderId,
  items,
  customerName,
  paymentMethod,
  subtotal,
  discount,
  total,
  cashierName,
  taxRate = 0.14,
}: {
  orderId?: number | string;
  items: PosCartItem[];
  customerName: string;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  total: number;
  cashierName: string;
  taxRate?: number;
}) {
  const tax = total - total / (1 + taxRate);
  const net = total - tax;

  return (
    <div
      id="receipt-print"
      className="mx-auto w-full max-w-[320px] rounded-xl border bg-white p-5 font-mono text-[12px] text-black"
    >
      <div className="text-center">
        <p className="text-lg font-bold tracking-[0.2em]">{SITE_NAME}</p>
        <p className="text-[10px] uppercase tracking-[0.18em]">{SITE_SLOGAN}</p>
        <p className="mt-1 text-[10px]">
          {SITE_MARK} · Est. {SITE_ESTABLISHED}
        </p>
      </div>
      <div className="my-3 border-t border-dashed border-black/30" />
      <p>Order: #{orderId ?? "PENDING"}</p>
      <p>Date: {formatDateTime(new Date())}</p>
      <p>Cashier: {cashierName}</p>
      <p>Customer: {customerName}</p>
      <p>Pay: {paymentMethod}</p>
      <div className="my-3 border-t border-dashed border-black/30" />
      {items.map((item) => (
        <div key={item.key} className="mb-2">
          <div className="flex justify-between gap-2">
            <span className="truncate">{item.name}</span>
            <span>{formatCurrency(item.unitPrice * item.quantity)}</span>
          </div>
          <p className="text-[10px] opacity-70">
            {item.variant} × {item.quantity}
            {item.sku ? ` · SKU ${item.sku}` : ""}
          </p>
        </div>
      ))}
      <div className="my-3 border-t border-dashed border-black/30" />
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Discount</span>
          <span>-{formatCurrency(discount)}</span>
        </div>
        <div className="flex justify-between">
          <span>Net</span>
          <span>{formatCurrency(net)}</span>
        </div>
        <div className="flex justify-between">
          <span>VAT ({Math.round(taxRate * 100)}%)</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between text-sm font-bold">
          <span>TOTAL</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
      <div className="my-3 border-t border-dashed border-black/30" />
      <div className="text-center">
        <p className="text-[10px]">Scan for digital receipt</p>
        <div className="mx-auto mt-2 flex h-20 w-20 items-center justify-center border border-black text-[10px]">
          QR
          <br />
          #{orderId ?? "—"}
        </div>
        <p className="mt-3 text-[10px]">Thank you for shopping 1990</p>
      </div>
    </div>
  );
}
