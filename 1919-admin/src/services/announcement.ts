import { api } from "./api";
import type { AnnouncementConfig, AnnouncementFormData } from "@/types/announcement";

export const announcementService = {
  async get(): Promise<AnnouncementConfig> {
    const { data } = await api.get<AnnouncementConfig>("/announcement");
    return data;
  },

  async update(form: AnnouncementFormData): Promise<AnnouncementConfig> {
    const { data } = await api.put<AnnouncementConfig>("/announcement", form);
    return data;
  },
};
