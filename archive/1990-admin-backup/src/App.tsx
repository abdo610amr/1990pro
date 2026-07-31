import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { LoadingState } from "@/components/shared/LoadingState";

const DashboardPage = lazy(() =>
  import("@/pages/DashboardPage").then((module) => ({ default: module.DashboardPage }))
);
const ProductsPage = lazy(() =>
  import("@/pages/ProductsPage").then((module) => ({ default: module.ProductsPage }))
);
const CategoriesPage = lazy(() =>
  import("@/pages/CategoriesPage").then((module) => ({ default: module.CategoriesPage }))
);
const InventoryPage = lazy(() =>
  import("@/pages/InventoryPage").then((module) => ({ default: module.InventoryPage }))
);
const OrdersPage = lazy(() =>
  import("@/pages/OrdersPage").then((module) => ({ default: module.OrdersPage }))
);
const CouponsPage = lazy(() =>
  import("@/pages/CouponsPage").then((module) => ({ default: module.CouponsPage }))
);
const ReviewsPage = lazy(() =>
  import("@/pages/ReviewsPage").then((module) => ({ default: module.ReviewsPage }))
);
const PopupManagerPage = lazy(() =>
  import("@/pages/PopupManagerPage").then((module) => ({ default: module.PopupManagerPage }))
);
const AnnouncementBarPage = lazy(() =>
  import("@/pages/AnnouncementBarPage").then((module) => ({ default: module.AnnouncementBarPage }))
);
const NotificationsPage = lazy(() =>
  import("@/pages/NotificationsPage").then((module) => ({ default: module.NotificationsPage }))
);
const CatalogConfigurationPage = lazy(() =>
  import("@/pages/DemoModePage").then((module) => ({ default: module.DemoModePage }))
);

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="p-8"><LoadingState variant="page" /></div>}>
        <Routes>
          <Route element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="coupons" element={<CouponsPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="popup" element={<PopupManagerPage />} />
            <Route path="announcement" element={<AnnouncementBarPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="demo-mode" element={<CatalogConfigurationPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Toaster richColors position="top-right" />
    </BrowserRouter>
  );
}
