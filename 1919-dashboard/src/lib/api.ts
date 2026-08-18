import type {
  PosBrand,
  PosCategory,
  PosOrder,
  PosProduct,
  PosStats,
  PosUser,
} from "@/types/pos";
import { resolveAssetUrl } from "@/lib/utils";

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

function getStoredAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("1990-pos-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const authToken = options.token ?? getStoredAuthToken();
  const { token, headers, ...requestOptions } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: {
      ...(requestOptions.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
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
        ? String((body as { message: string }).message)
        : `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, body);
  }

  return body as T;
}

function adaptProduct(raw: PosProduct): PosProduct {
  return {
    ...raw,
    coverImage: resolveAssetUrl(raw.coverImage),
    gallery: (raw.gallery ?? []).map((item) => resolveAssetUrl(item)),
    variants: (raw.variants?.length
      ? raw.variants
      : ((raw as unknown as { sizes?: { size: string; price: number; stock?: number; sku?: string }[] })
          .sizes ?? []
        ).map((size) => ({
          label: size.size,
          price: size.price,
          stock: size.stock ?? 0,
          sku: size.sku,
        }))
    ).map((variant) => ({
      ...variant,
      price: Number(variant.price) || 0,
      stock: Number(variant.stock) || 0,
    })),
  };
}

export const posApi = {
  health: () => apiRequest<{ status: string }>("/health"),

  login: (identifier: string, password: string) =>
    apiRequest<{ token: string; user: PosUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    }),

  me: (token: string) => apiRequest<PosUser>("/auth/me", { token }),

  sellers: () => apiRequest<PosUser[]>("/users/sellers"),

  users: (token: string) => apiRequest<PosUser[]>("/users", { token }),

  createUser: (token: string, payload: {
    full_name: string;
    username: string;
    email?: string;
    password: string;
    role?: string;
    max_discount?: number;
    monthly_target?: number;
    status?: string;
  }) =>
    apiRequest<{ message: string; user: PosUser }>("/users", {
      token,
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateUser: (
    token: string,
    id: number,
    payload: Partial<{
      full_name: string;
      username: string;
      email: string;
      role: string;
      max_discount: number;
      monthly_target: number;
      status: string;
    }>
  ) =>
    apiRequest<{ message: string; user: PosUser }>(`/users/${id}`, {
      token,
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  toggleUserStatus: (token: string, id: number, status: "active" | "disabled") =>
    apiRequest<{ message: string; user: PosUser }>(`/users/${id}/status`, {
      token,
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  resetUserPassword: (token: string, id: number, password: string) =>
    apiRequest<{ message: string }>(`/users/${id}/password`, {
      token,
      method: "PATCH",
      body: JSON.stringify({ password }),
    }),

  deleteUser: (token: string, id: number) =>
    apiRequest<{ message: string }>(`/users/${id}`, {
      token,
      method: "DELETE",
    }),

  sellerPerformance: () =>
    apiRequest<import("@/types/pos").SellerPerformance[]>("/stats/seller-performance"),

  products: async () => {
    const data = await apiRequest<PosProduct[]>("/products");
    return data.map(adaptProduct);
  },

  searchProducts: async (params: Record<string, string | number | undefined>) => {
    const query = new URLSearchParams(
      Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== "")
        .map(([key, value]) => [key, String(value)])
    );
    const data = await apiRequest<{
      items: PosProduct[];
      total: number;
      page: number;
      totalPages: number;
    }>(`/products/search?${query.toString()}`);
    return { ...data, items: data.items.map(adaptProduct) };
  },

  inventory: async () => {
    const data = await apiRequest<
      {
        id: number;
        name: string;
        coverImage: string;
        categoryId: number | null;
        variants: { label: string; price: number; stock: number; sku?: string }[];
        lowStockThreshold: number;
        stockStatus: string;
        totalStock: number;
      }[]
    >("/products/inventory");
    return data.map((item) => ({
      ...item,
      coverImage: resolveAssetUrl(item.coverImage),
    }));
  },

  updateInventory: (
    productId: number,
    variants: { label: string; price: number; stock: number; sku?: string | null }[],
    lowStockThreshold?: number
  ) =>
    apiRequest<{ message: string; product: PosProduct }>(
      `/products/${productId}/inventory`,
      {
        method: "PATCH",
        body: JSON.stringify({ variants, lowStockThreshold }),
      }
    ),

  stockCheck: (productId: number, variant: string, quantity: number) =>
    apiRequest<{ available: boolean; stock: number; requested: number }>(
      `/orders/${productId}/stock-check?variant=${encodeURIComponent(variant)}&quantity=${quantity}`
    ),

  categories: () => apiRequest<PosCategory[]>("/categories"),

  brands: async (options?: { all?: boolean }) => {
    const query = options?.all ? "?all=true" : "";
    const data = await apiRequest<PosBrand[]>(`/brands${query}`);
    return data.map((brand) => ({
      ...brand,
      logo: resolveAssetUrl(brand.logo),
      coverImage: resolveAssetUrl(brand.coverImage),
    }));
  },

  brandAnalytics: () => apiRequest<import("@/types/pos").PosBrandAnalytics>("/stats/brand-analytics"),

  brandReports: () => apiRequest<import("@/types/pos").PosBrandReport[]>("/stats/brand-reports"),

  orders: () => apiRequest<PosOrder[]>("/orders"),

  createOrder: async (form: FormData | Record<string, unknown>) => {
    if (form instanceof FormData) {
      return apiRequest<{ message: string; orderId: number }>("/orders", {
        method: "POST",
        body: form,
      });
    }
    return apiRequest<{ message: string; orderId: number }>("/orders", {
      method: "POST",
      body: JSON.stringify(form),
    });
  },

  updateOrderStatus: (id: number, status: string) =>
    apiRequest<{ message: string; order: PosOrder }>(`/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),

  returnOrder: (
    id: number,
    payload: {
      type?: "full" | "partial" | "exchange";
      reason?: string;
      items?: {
        productId?: number | null;
        variant?: string;
        size?: string;
        quantity?: number;
      }[];
    }
  ) =>
    apiRequest<{ message: string; order: PosOrder }>(`/orders/${id}/return`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  customers: (token: string) =>
    apiRequest<
      {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
        phone?: string;
        orderCount: number;
        totalSpend: number;
        lastOrderAt?: string | null;
        createdAt?: string;
      }[]
    >("/auth/customers", { token }),

  applyPromo: (payload: {
    code: string;
    totalAmount: number;
    email?: string;
    cartItems?: unknown[];
  }) =>
    apiRequest<{
      type: string;
      discount: number;
      finalPrice: number;
      promo?: unknown;
      message?: string;
    }>("/promo/apply", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  stats: () => apiRequest<PosStats>("/stats"),

  notifications: () =>
    apiRequest<
      {
        id: number;
        type: string;
        title: string;
        message: string;
        meta: Record<string, unknown> | null;
        read: boolean;
        createdAt: string;
      }[]
    >("/notifications/log"),

  unreadCount: () =>
    apiRequest<{ count: number }>("/notifications/log/unread-count"),

  markNotificationRead: (id: number) =>
    apiRequest(`/notifications/log/${id}/read`, { method: "PATCH" }),

  markAllNotificationsRead: () =>
    apiRequest<{ message: string }>("/notifications/log/read-all", {
      method: "PATCH",
    }),

  createProduct: (form: FormData) =>
    apiRequest<{ message: string }>("/products", {
      method: "POST",
      body: form,
    }),

  updateProduct: (id: number, form: FormData) =>
    apiRequest<{ message: string }>(`/products/${id}`, {
      method: "PUT",
      body: form,
    }),

  deleteProduct: (id: number) =>
    apiRequest<{ message: string }>(`/products/${id}`, { method: "DELETE" }),

  createCategory: (payload: {
    name: string;
    description?: string;
    image?: string | null;
    sortOrder?: number;
    active?: boolean;
  }) =>
    apiRequest<PosCategory>("/categories", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateCategory: (
    id: number,
    payload: Partial<{
      name: string;
      description: string;
      image: string | null;
      sortOrder: number;
      active: boolean;
    }>
  ) =>
    apiRequest<PosCategory>(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  deleteCategory: (id: number) =>
    apiRequest<{ message: string }>(`/categories/${id}`, { method: "DELETE" }),

  createBrand: (form: FormData) =>
    apiRequest<PosBrand>("/brands", { method: "POST", body: form }),

  updateBrand: (id: number, form: FormData) =>
    apiRequest<PosBrand>(`/brands/${id}`, { method: "PUT", body: form }),

  updateBrandStatus: (id: number, status: "active" | "disabled") =>
    apiRequest<PosBrand>(`/brands/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  deleteBrand: (id: number) =>
    apiRequest<{ message: string }>(`/brands/${id}`, { method: "DELETE" }),

  listPromos: () =>
    apiRequest<
      {
        id: number;
        code: string;
        active: number | boolean;
        start_date: string | null;
        end_date: string | null;
        usage_limit: number | null;
        used_count: number;
        min_order: number;
        type: string;
        discount_value: number;
        bundle_buy: string | null;
        bundle_get: string | null;
        buy_qty: number | null;
        get_qty: number | null;
      }[]
    >("/promo"),

  createPromo: (payload: Record<string, unknown>) =>
    apiRequest<{ message: string }>("/promo", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  deletePromo: (id: number) =>
    apiRequest<{ message: string }>(`/promo/${id}`, { method: "DELETE" }),

  listReviews: () =>
    apiRequest<
      {
        id: number;
        productId: number;
        productName?: string;
        name: string;
        rating: number;
        comment: string;
        createdAt?: string;
      }[]
    >("/reviews"),

  deleteReview: (id: number) =>
    apiRequest<{ message: string }>(`/reviews/${id}`, { method: "DELETE" }),

  getAnnouncement: () =>
    apiRequest<{
      enabled: boolean;
      text: string;
      link: string;
      backgroundColor: string;
      textColor: string;
    }>("/announcement"),

  updateAnnouncement: (payload: {
    enabled: boolean;
    text: string;
    link: string;
    backgroundColor: string;
    textColor: string;
  }) =>
    apiRequest<typeof payload>("/announcement", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  getPopup: () =>
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

  updatePopup: (payload: FormData | Record<string, unknown>) => {
    if (payload instanceof FormData) {
      return apiRequest<{
        enabled: boolean;
        title: string;
        description: string;
        image: string;
        buttonText: string;
        buttonUrl: string;
        showOnce: boolean;
        showEveryVisit: boolean;
      }>("/popup", { method: "PUT", body: payload });
    }
    return apiRequest<{
      enabled: boolean;
      title: string;
      description: string;
      image: string;
      buttonText: string;
      buttonUrl: string;
      showOnce: boolean;
      showEveryVisit: boolean;
    }>("/popup", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  getNotificationSettings: () =>
    apiRequest<{
      enabled: boolean;
      provider: string;
      emails: string[];
    }>("/notifications/settings"),

  updateNotificationSettings: (payload: {
    enabled: boolean;
    provider: string;
    emails: string[];
  }) =>
    apiRequest<typeof payload>("/notifications/settings", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  sendTestNotification: () =>
    apiRequest<{ message: string }>("/notifications/test", {
      method: "POST",
    }),

  clearNotifications: () =>
    apiRequest<{ message?: string }>("/notifications/log", {
      method: "DELETE",
    }),

  deleteOrder: (id: number, opts?: { restoreStock?: boolean }) => {
    const qs =
      opts?.restoreStock === undefined
        ? ""
        : `?restoreStock=${opts.restoreStock ? "true" : "false"}`;
    return apiRequest<{ message: string; restoredStock?: boolean }>(
      `/orders/${id}${qs}`,
      { method: "DELETE" }
    );
  },

  getPlatform: () =>
    apiRequest<{
      productType: string;
      label: string;
      variantType: string;
      variantLabel: string;
      variantPresets: string[];
      shopSubtitle?: string;
      enableSizeFilter?: boolean;
    }>("/platform"),

  updatePlatform: (productType: string) =>
    apiRequest<{
      productType: string;
      label: string;
      variantType: string;
      variantLabel: string;
      variantPresets: string[];
    }>("/platform", {
      method: "PUT",
      body: JSON.stringify({ productType }),
    }),

  // ── Homepage Carousel (Website Management) ──
  getHomepageCarousel: () =>
    apiRequest<
      {
        id: string;
        image: string;
        title: string;
        description: string;
        link: string;
        sort_order: number;
        is_active: boolean;
        created_at: string;
        updated_at: string;
      }[]
    >("/website/homepage-carousel"),

  createHomepageCarouselItem: (form: FormData) =>
    apiRequest<{
      id: string;
      image: string;
      title: string;
      description: string;
      link: string;
      sort_order: number;
      is_active: boolean;
    }>("/website/homepage-carousel", { method: "POST", body: form }),

  updateHomepageCarouselItem: (id: string, form: FormData) =>
    apiRequest<{
      id: string;
      image: string;
      title: string;
      description: string;
      link: string;
      sort_order: number;
      is_active: boolean;
    }>(`/website/homepage-carousel/${id}`, { method: "PUT", body: form }),

  deleteHomepageCarouselItem: (id: string) =>
    apiRequest<{ message: string }>(`/website/homepage-carousel/${id}`, {
      method: "DELETE",
    }),

  reorderHomepageCarouselItem: (id: string, sort_order: number) =>
    apiRequest<
      {
        id: string;
        image: string;
        title: string;
        description: string;
        link: string;
        sort_order: number;
        is_active: boolean;
      }[]
    >(`/website/homepage-carousel/${id}/reorder`, {
      method: "PATCH",
      body: JSON.stringify({ sort_order }),
    }),

  toggleHomepageCarouselStatus: (id: string, is_active: boolean) =>
    apiRequest<{
      id: string;
      image: string;
      title: string;
      description: string;
      link: string;
      sort_order: number;
      is_active: boolean;
    }>(`/website/homepage-carousel/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ is_active }),
    }),
};

export function buildProductFormData(input: {
  name: string;
  description: string;
  variants: { label: string; price: number; stock: number; sku?: string | null }[];
  tags: string[];
  variantType: string;
  variantLabel: string;
  lowStockThreshold: number;
  categoryId?: number | null;
  brandId?: number | null;
  cover?: File;
  gallery?: File[];
}) {
  const body = new FormData();
  body.append("name", input.name);
  body.append("description", input.description);
  body.append("variants", JSON.stringify(input.variants));
  body.append(
    "sizes",
    JSON.stringify(
      input.variants.map((v) => ({
        size: v.label,
        price: v.price,
        stock: v.stock,
        sku: v.sku,
      }))
    )
  );
  body.append("tags", JSON.stringify(input.tags));
  body.append("variantType", input.variantType);
  body.append("variantLabel", input.variantLabel);
  body.append("lowStockThreshold", String(input.lowStockThreshold));
  if (input.categoryId) body.append("categoryId", String(input.categoryId));
  if (input.brandId) body.append("brandId", String(input.brandId));
  if (input.cover) body.append("cover", input.cover);
  input.gallery?.forEach((file) => body.append("gallery", file));
  return body;
}
