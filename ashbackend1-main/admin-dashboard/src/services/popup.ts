import { api } from "./api";
import type { PopupConfig, PopupFormData } from "@/types/popup";

export const popupService = {
  async get(): Promise<PopupConfig> {
    const { data } = await api.get<PopupConfig>("/popup");
    return data;
  },

  async update(form: PopupFormData): Promise<PopupConfig> {
    if (form.imageFile) {
      const formData = new FormData();
      formData.append("enabled", String(form.enabled));
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("buttonText", form.buttonText);
      formData.append("buttonUrl", form.buttonUrl);
      formData.append("showOnce", String(form.showOnce));
      formData.append("showEveryVisit", String(form.showEveryVisit));
      if (form.image) formData.append("image", form.image);
      formData.append("imageFile", form.imageFile);

      const { data } = await api.put<PopupConfig>("/popup", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    }

    const { imageFile: _, ...payload } = form;
    const { data } = await api.put<PopupConfig>("/popup", payload);
    return data;
  },
};
