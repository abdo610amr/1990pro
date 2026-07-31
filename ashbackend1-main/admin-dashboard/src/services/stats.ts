import { api } from "./api";
import type { StoreStats } from "@/types/stats";

export const statsService = {
  async get(): Promise<StoreStats> {
    const { data } = await api.get<StoreStats>("/stats");
    return data;
  },
};
