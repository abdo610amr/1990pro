import { api } from "./api";
import type { PlatformConfig, ProductType } from "@/types/platform";

export const platformService = {
  async get(): Promise<PlatformConfig> {
    const { data } = await api.get<PlatformConfig>("/platform");
    return data;
  },

  async update(productType: ProductType): Promise<PlatformConfig> {
    const { data } = await api.put<PlatformConfig>("/platform", { productType });
    return data;
  },
};
