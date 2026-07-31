import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { ProductsPage } from "@/pages/ProductsPage";
import { CategoriesPage } from "@/pages/CategoriesPage";
import { InventoryPage } from "@/pages/InventoryPage";
import { OrdersPage } from "@/pages/OrdersPage";
import { CouponsPage } from "@/pages/CouponsPage";
import { ReviewsPage } from "@/pages/ReviewsPage";
import { PopupManagerPage } from "@/pages/PopupManagerPage";
import { AnnouncementBarPage } from "@/pages/AnnouncementBarPage";
import { NotificationsPage } from "@/pages/NotificationsPage";
import { DemoModePage } from "@/pages/DemoModePage";

export default function App() {
  return (
    <BrowserRouter>
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
          <Route path="demo-mode" element={<DemoModePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster richColors position="top-right" />
    </BrowserRouter>
  );
}
