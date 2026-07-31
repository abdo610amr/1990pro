import { api } from "./api";
import type { AnnouncementConfig } from "@/types/announcement";

export const announcementService = {
  async get(): Promise<AnnouncementConfig> {
    const { data } = await api.get<AnnouncementConfig>("/announcement");
    return data;
  },
};
