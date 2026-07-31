import { api } from "./api";
import type { Product, ProductFormData } from "@/types/product";

function buildProductFormData(form: ProductFormData): FormData {
  const body = new FormData();
  body.append("name", form.name);
  body.append("description", form.description);
  body.append("variants", JSON.stringify(form.variants));
  body.append("sizes", JSON.stringify(
    form.variants.map((v) => ({
      size: v.label,
      price: v.price,
      stock: v.stock,
      sku: v.sku,
    }))
  ));
  body.append("tags", JSON.stringify(form.tags));
  body.append("variantType", form.variantType);
  body.append("variantLabel", form.variantLabel);
  body.append("lowStockThreshold", String(form.lowStockThreshold));
  if (form.categoryId) body.append("categoryId", String(form.categoryId));
  if (form.cover) body.append("cover", form.cover);
  form.gallery?.forEach((file) => body.append("gallery", file));
  return body;
}

export const productService = {
  async getAll(): Promise<Product[]> {
    const { data } = await api.get<Product[]>("/products");
    return data;
  },

  async getById(id: number): Promise<Product> {
    const { data } = await api.get<Product>(`/products/${id}`);
    return data;
  },

  async create(form: ProductFormData): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>(
      "/products",
      buildProductFormData(form),
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },

  async update(id: number, form: ProductFormData): Promise<{ message: string }> {
    const { data } = await api.put<{ message: string }>(
      `/products/${id}`,
      buildProductFormData(form),
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },

  async remove(id: number): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>(`/products/${id}`);
    return data;
  },
};
