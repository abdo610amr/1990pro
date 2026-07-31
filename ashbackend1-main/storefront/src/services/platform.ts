import { api } from "./api";
import type { PlatformConfig } from "@/types/platform";

export const platformService = {
  async get(): Promise<PlatformConfig> {
    const { data } = await api.get<PlatformConfig>("/platform");
    return data;
  },
};
