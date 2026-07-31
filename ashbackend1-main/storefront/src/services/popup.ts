import { api } from "./api";
import type { PopupConfig } from "@/types/popup";

export const popupService = {
  async get(): Promise<PopupConfig> {
    const { data } = await api.get<PopupConfig>("/popup");
    return data;
  },
};
