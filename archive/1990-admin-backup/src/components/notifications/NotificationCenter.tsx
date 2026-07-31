import { useMemo, useState } from "react";
import { CheckCheck, Search } from "lucide-react";
import { notificationService } from "@/services/notifications";
import { useAsyncData } from "@/hooks/useAsyncData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingState } from "@/components/shared/LoadingState";

export function NotificationCenter() {
  const log = useAsyncData(notificationService.getLog);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const entries = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return (log.data ?? []).filter((entry) => {
      const matchesQuery =
        !normalized ||
        entry.title.toLowerCase().includes(normalized) ||
        entry.message.toLowerCase().includes(normalized);
      const matchesFilter =
        filter === "all" ||
        (filter === "unread" ? !entry.read : entry.type === filter);
      return matchesQuery && matchesFilter;
    });
  }, [filter, log.data, query]);

  return (
    <Card>
      <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="font-serif text-xl">Notification center</CardTitle>
          <CardDescription>Search and filter live order and inventory alerts.</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={!log.data?.some((entry) => !entry.read)}
          onClick={async () => {
            await notificationService.markAllRead();
            await log.refetch();
          }}
        >
          <CheckCheck className="h-4 w-4" />
          Mark all read
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search notifications…"
              className="pl-9"
            />
          </div>
          <Select value={filter} onValueChange={(value) => setFilter(value ?? "all")}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Filter alerts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All alerts</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="new_order">New orders</SelectItem>
              <SelectItem value="low_stock">Low stock</SelectItem>
              <SelectItem value="out_of_stock">Out of stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {log.loading ? (
          <LoadingState rows={3} />
        ) : entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No notifications match this view.
          </div>
        ) : (
          <div className="divide-y overflow-hidden rounded-2xl border">
            {entries.slice(0, 20).map((entry) => (
              <div
                key={entry.id}
                className="flex gap-3 bg-card px-4 py-3 transition-colors hover:bg-secondary/35"
              >
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    entry.read ? "bg-border" : "bg-primary"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{entry.title}</p>
                    <Badge variant={entry.read ? "secondary" : "default"}>
                      {entry.read ? "Read" : "Unread"}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{entry.message}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
