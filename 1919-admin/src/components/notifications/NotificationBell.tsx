import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCheck, Trash2, ShoppingCart, PackageX, PackageMinus } from "lucide-react";
import { toast } from "sonner";
import { notificationService } from "@/services/notifications";
import { getErrorMessage } from "@/services/api";
import type {
  NotificationLogEntry,
  NotificationLogType,
} from "@/types/notification";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const POLL_MS = 30_000;

const TYPE_ICON: Record<NotificationLogType, typeof Bell> = {
  new_order: ShoppingCart,
  low_stock: PackageMinus,
  out_of_stock: PackageX,
};

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<NotificationLogEntry[]>([]);
  const [unread, setUnread] = useState(0);

  const refreshCount = useCallback(async () => {
    try {
      setUnread(await notificationService.getUnreadCount());
    } catch {
      // Backend may be down — keep the bell quiet.
    }
  }, []);

  const loadLog = useCallback(async () => {
    try {
      const log = await notificationService.getLog();
      setEntries(log);
      setUnread(log.filter((e) => !e.read).length);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }, []);

  // Poll the unread count in the background.
  useEffect(() => {
    void refreshCount();
    const id = window.setInterval(refreshCount, POLL_MS);
    return () => window.clearInterval(id);
  }, [refreshCount]);

  // Load the full list whenever the dropdown opens.
  useEffect(() => {
    if (open) void loadLog();
  }, [open, loadLog]);

  const markAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setEntries((prev) => prev.map((e) => ({ ...e, read: true })));
      setUnread(0);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const clearAll = async () => {
    try {
      await notificationService.clear();
      setEntries([]);
      setUnread(0);
      toast.success("Notifications cleared");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const onEntryClick = async (entry: NotificationLogEntry) => {
    if (entry.read) return;
    try {
      await notificationService.markRead(entry.id);
      setEntries((prev) =>
        prev.map((e) => (e.id === entry.id ? { ...e, read: true } : e))
      );
      setUnread((c) => Math.max(0, c - 1));
    } catch {
      // non-critical
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-semibold">Notifications</span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={markAllRead}
              disabled={!entries.some((e) => !e.read)}
              aria-label="Mark all as read"
              title="Mark all as read"
            >
              <CheckCheck className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={clearAll}
              disabled={!entries.length}
              aria-label="Clear notifications"
              title="Clear all"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {entries.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-muted-foreground">
              You're all caught up.
            </div>
          ) : (
            entries.map((entry) => {
              const Icon = TYPE_ICON[entry.type] ?? Bell;
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => onEntryClick(entry)}
                  className={cn(
                    "flex w-full gap-3 border-b px-3 py-3 text-left transition-colors last:border-b-0 hover:bg-accent/50",
                    !entry.read && "bg-accent/30"
                  )}
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">{entry.title}</span>
                      {!entry.read && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-destructive" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{entry.message}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground/70">
                      {timeAgo(entry.createdAt)}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
