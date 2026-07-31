import { api } from "./api";
import type {
  NotificationLogEntry,
  NotificationSettings,
} from "@/types/notification";

export const notificationService = {
  async getSettings(): Promise<NotificationSettings> {
    const { data } = await api.get<NotificationSettings>("/notifications/settings");
    return data;
  },

  async updateSettings(settings: NotificationSettings): Promise<NotificationSettings> {
    const { data } = await api.put<NotificationSettings>(
      "/notifications/settings",
      settings
    );
    return data;
  },

  async sendTest(): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>("/notifications/test");
    return data;
  },

  async getLog(): Promise<NotificationLogEntry[]> {
    const { data } = await api.get<NotificationLogEntry[]>("/notifications/log");
    return data;
  },

  async getUnreadCount(): Promise<number> {
    const { data } = await api.get<{ count: number }>(
      "/notifications/log/unread-count"
    );
    return data.count;
  },

  async markRead(id: number): Promise<void> {
    await api.patch(`/notifications/log/${id}/read`);
  },

  async markAllRead(): Promise<void> {
    await api.patch("/notifications/log/read-all");
  },

  async clear(): Promise<void> {
    await api.delete("/notifications/log");
  },
};
