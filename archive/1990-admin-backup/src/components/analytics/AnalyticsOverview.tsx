import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Order } from "@/types/order";
import type { StoreStats } from "@/types/stats";
import { ORDER_STATUS_OPTIONS } from "@/types/order";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

const STATUS_COLORS = ["#5E0F1D", "#8A2436", "#B85F70", "#D798A4", "#6E746C", "#B42318"];

interface AnalyticsOverviewProps {
  orders: Order[];
  stats: StoreStats;
}

export function AnalyticsOverview({ orders, stats }: AnalyticsOverviewProps) {
  const salesData = useMemo(
    () =>
      orders
        .slice(0, 10)
        .reverse()
        .map((order) => ({
          name: `#${order.id}`,
          revenue: Number(order.totalPrice) || 0,
        })),
    [orders]
  );

  const statusData = useMemo(
    () =>
      ORDER_STATUS_OPTIONS.map((status) => ({
        name: status.label,
        value: stats.statusBreakdown[status.value] ?? 0,
      })).filter((entry) => entry.value > 0),
    [stats.statusBreakdown]
  );

  return (
    <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Revenue pulse</CardTitle>
          <CardDescription>Order value across the ten most recent purchases.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ left: -15, right: 8 }}>
                <defs>
                  <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8A2436" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8A2436" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  fontSize={11}
                  tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--popover)",
                    color: "var(--popover-foreground)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8A2436"
                  strokeWidth={2.5}
                  fill="url(#revenue-fill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Order fulfillment</CardTitle>
          <CardDescription>Live distribution by current status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[210px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  innerRadius={62}
                  outerRadius={88}
                  paddingAngle={3}
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--popover)",
                    color: "var(--popover-foreground)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {statusData.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between gap-3 text-xs">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[index % STATUS_COLORS.length] }}
                  />
                  {entry.name}
                </span>
                <span className="font-semibold">{entry.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
