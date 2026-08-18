"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, ShoppingBag, DollarSign, Calendar, Mail, Phone, MapPin } from "lucide-react";
import { posApi } from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ErpPageHeader } from "@/components/erp/page-header";
import { ErpToolbar } from "@/components/erp/toolbar";
import { ErpTable, ErpTd, ErpTh } from "@/components/erp/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";

export default function AdminCustomersPage() {
  const token = useAuthStore((s) => s.token);
  const { data: customers = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: () => posApi.customers(token!),
    enabled: !!token,
  });

  const [query, setQuery] = useState("");

  const filtered = customers.filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const name = `${c.firstName || ""} ${c.lastName || ""}`.toLowerCase();
    return name.includes(q) || c.email?.toLowerCase().includes(q) || c.phone?.includes(q);
  });

  return (
    <div className="space-y-6">
      <ErpPageHeader
        eyebrow="CRM & Audience"
        title="Customer Directory & Order History"
        description="Inspect registered customer accounts, order counts, lifetime spend, and activity."
      />

      <ErpToolbar
        search={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search customer by name, email, or phone…"
        onRefresh={() => void refetch()}
        refreshing={isFetching}
      />

      <ErpTable>
        <thead>
          <tr>
            <ErpTh>Customer</ErpTh>
            <ErpTh>Email</ErpTh>
            <ErpTh>Phone</ErpTh>
            <ErpTh>Order Count</ErpTh>
            <ErpTh>Total Spend</ErpTh>
            <ErpTh>Last Order Date</ErpTh>
          </tr>
        </thead>
        <tbody>
          {filtered.map((c) => (
            <tr key={c.id} className="hover:bg-secondary/40">
              <ErpTd className="font-semibold">
                <p className="text-sm font-bold">{`${c.firstName || ""} ${c.lastName || ""}`.trim() || "Customer"}</p>
                <p className="text-[10px] text-muted-foreground">ID: #{c.id}</p>
              </ErpTd>
              <ErpTd className="font-mono text-xs">{c.email}</ErpTd>
              <ErpTd className="font-mono text-xs">{c.phone || "—"}</ErpTd>
              <ErpTd>
                <Badge variant="outline" className="font-mono font-bold">
                  {c.orderCount} order(s)
                </Badge>
              </ErpTd>
              <ErpTd className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(c.totalSpend)}
              </ErpTd>
              <ErpTd className="text-xs text-muted-foreground">
                {c.lastOrderAt ? formatDateTime(c.lastOrderAt) : "No orders yet"}
              </ErpTd>
            </tr>
          ))}
        </tbody>
      </ErpTable>
    </div>
  );
}
