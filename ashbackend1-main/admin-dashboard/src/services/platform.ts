import { api } from "./api";
import type { DemoSeedResult, PlatformConfig, ProductType } from "@/types/platform";

export const platformService = {
  async get(): Promise<PlatformConfig> {
    const { data } = await api.get<PlatformConfig>("/platform");
    return data;
  },

  async update(productType: ProductType): Promise<PlatformConfig> {
    const { data } = await api.put<PlatformConfig>("/platform", { productType });
    return data;
  },

  async seedFashionDemo(): Promise<DemoSeedResult> {
    const { data } = await api.post<DemoSeedResult>("/platform/demo/fashion");
    return data;
  },

  async seedPerfumeDemo(): Promise<DemoSeedResult> {
    const { data } = await api.post<DemoSeedResult>("/platform/demo/perfume");
    return data;
  },
};
