import type {
  BackendBrand,
  BackendCategory,
  BackendOrder,
  BackendProduct,
  BackendReview,
  BackendUser,
} from "@/lib/backend-types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ApiOptions extends RequestInit {
  token?: string | null;
}

export async function apiRequest<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const { token, headers, ...requestOptions } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: {
      ...(requestOptions.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const contentType = response.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof body === "object" && body && "message" in body
        ? String(body.message)
        : `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, body);
  }

  return body as T;
}

export const catalogApi = {
  products: () => apiRequest<BackendProduct[]>("/products"),
  searchProducts: (params: {
    q?: string;
    categoryId?: string;
    brandId?: string;
    productType?: string;
    availability?: string;
    size?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams(
      Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== "")
        .map(([key, value]) => [key, String(value)])
    );
    return (
    apiRequest<{
      items: BackendProduct[];
      total: number;
      page: number;
      totalPages: number;
    }>(`/products/search?${query.toString()}`)
    );
  },
  categories: () => apiRequest<BackendCategory[]>("/categories"),
  brands: () => apiRequest<BackendBrand[]>("/brands"),
  reviews: () => apiRequest<BackendReview[]>("/reviews"),
  createReview: (payload: {
    product_id: number;
    name: string;
    rating: number;
    comment?: string;
  }) =>
    apiRequest<{ message: string }>("/reviews", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  announcement: () =>
    apiRequest<{
      enabled: boolean;
      text: string;
      link: string;
      backgroundColor: string;
      textColor: string;
    }>("/announcement"),
  popup: () =>
    apiRequest<{
      enabled: boolean;
      title: string;
      description: string;
      image: string;
      buttonText: string;
      buttonUrl: string;
      showOnce: boolean;
      showEveryVisit: boolean;
    }>("/popup"),
};

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<{ token: string; user: BackendUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) =>
    apiRequest<{ token: string; user: BackendUser }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  me: (token: string) =>
    apiRequest<BackendUser>("/auth/me", { token }),
  updateProfile: (token: string, data: Record<string, unknown>) =>
    apiRequest<BackendUser>("/auth/profile", {
      method: "PUT",
      token,
      body: JSON.stringify(data),
    }),
  forgotPassword: (email: string) =>
    apiRequest<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  resetPassword: (token: string, password: string) =>
    apiRequest<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }),
  addresses: (token: string) =>
    apiRequest<Array<Record<string, unknown>>>("/auth/addresses", { token }),
  addAddress: (token: string, data: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>("/auth/addresses", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    }),
  updateAddress: (
    token: string,
    id: string,
    data: Record<string, unknown>
  ) =>
    apiRequest<Record<string, unknown>>(`/auth/addresses/${id}`, {
      method: "PUT",
      token,
      body: JSON.stringify(data),
    }),
  deleteAddress: (token: string, id: string) =>
    apiRequest<{ message: string }>(`/auth/addresses/${id}`, {
      method: "DELETE",
      token,
    }),
  orders: (token: string) =>
    apiRequest<BackendOrder[]>("/auth/orders", { token }),
  wishlist: (token: string) =>
    apiRequest<number[]>("/auth/wishlist", { token }),
  addWishlist: (token: string, productId: number) =>
    apiRequest<number[]>(`/auth/wishlist/${productId}`, {
      method: "POST",
      token,
    }),
  removeWishlist: (token: string, productId: number) =>
    apiRequest<number[]>(`/auth/wishlist/${productId}`, {
      method: "DELETE",
      token,
    }),
};

export interface PromoResult {
  type: string;
  discount?: number;
  finalPrice?: number;
  promo?: string;
  message: string;
}

export const commerceApi = {
  applyPromo: (payload: {
    code: string;
    totalAmount: number;
    email?: string;
    cartItems: Array<{
      size: string;
      quantity: number;
      price: number;
    }>;
  }) =>
    apiRequest<PromoResult>("/promo/apply", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  createOrder: (formData: FormData) =>
    apiRequest<{ message: string; orderId: number }>("/orders", {
      method: "POST",
      body: formData,
    }),
  checkStock: (productId: number, variant: string, quantity: number) =>
    apiRequest<{ available: boolean; stock: number; requested: number }>(
      `/orders/${productId}/stock-check?variant=${encodeURIComponent(variant)}&quantity=${quantity}`
    ),
};
