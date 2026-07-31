export type NotificationProvider = "resend" | "brevo" | "mailgun" | "ses";

export interface NotificationSettings {
  enabled: boolean;
  provider: NotificationProvider;
  emails: string[];
}

export type NotificationLogType = "new_order" | "low_stock" | "out_of_stock";

export interface NotificationLogEntry {
  id: number;
  type: NotificationLogType;
  title: string;
  message: string;
  meta: Record<string, unknown> | null;
  read: boolean;
  createdAt: string;
}
