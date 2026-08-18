"use client";

import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bell, CheckCheck, Trash2, ShieldAlert } from "lucide-react";
import { posApi } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { ErpPageHeader } from "@/components/erp/page-header";
import { ErpTable, ErpTd, ErpTh } from "@/components/erp/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminNotificationsPage() {
  const { data: log = [], refetch, isFetching } = useQuery({
    queryKey: ["admin-notifications-log"],
    queryFn: posApi.notifications,
  });

  const { data: unreadData, refetch: refetchUnread } = useQuery({
    queryKey: ["admin-notifications-unread"],
    queryFn: posApi.unreadCount,
  });

  const handleMarkAllRead = async () => {
    try {
      await posApi.markAllNotificationsRead();
      toast.success("All notifications marked as read");
      await refetch();
      await refetchUnread();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Clear all notification logs?")) return;
    try {
      await posApi.clearNotifications();
      toast.success("Notification log cleared");
      await refetch();
      await refetchUnread();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Clear failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <ErpPageHeader
          eyebrow="System Events"
          title="Notifications & Audit Log"
          description="Log of system events, new order alerts, stock warnings, and staff actions."
        />
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="gap-2">
            <CheckCheck className="h-4 w-4" /> Mark All Read
          </Button>
          <Button variant="destructive" size="sm" onClick={handleClearAll} className="gap-2">
            <Trash2 className="h-4 w-4" /> Clear Log
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm font-semibold">
        <span>Unread Notifications:</span>
        <Badge variant={unreadData?.count ? "destructive" : "secondary"}>
          {unreadData?.count ?? 0}
        </Badge>
      </div>

      <ErpTable>
        <thead>
          <tr>
            <ErpTh>Event Type</ErpTh>
            <ErpTh>Title</ErpTh>
            <ErpTh>Message</ErpTh>
            <ErpTh>Status</ErpTh>
            <ErpTh>Date & Time</ErpTh>
          </tr>
        </thead>
        <tbody>
          {!log.length ? (
            <tr>
              <td colSpan={5} className="py-8 text-center text-xs text-muted-foreground">
                No notification logs recorded.
              </td>
            </tr>
          ) : (
            log.map((item) => (
              <tr key={item.id} className={item.read ? "hover:bg-secondary/30 opacity-70" : "bg-secondary/40 font-semibold"}>
                <ErpTd>
                  <Badge variant="outline" className="text-[10px] uppercase font-mono">
                    {item.type}
                  </Badge>
                </ErpTd>
                <ErpTd className="font-bold">{item.title}</ErpTd>
                <ErpTd className="text-xs">{item.message}</ErpTd>
                <ErpTd>
                  <Badge variant={item.read ? "secondary" : "default"}>
                    {item.read ? "Read" : "Unread"}
                  </Badge>
                </ErpTd>
                <ErpTd className="text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</ErpTd>
              </tr>
            ))
          )}
        </tbody>
      </ErpTable>
    </div>
  );
}
