import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { HomePage } from "@/pages/HomePage";
import { ShopPage } from "@/pages/ShopPage";
import { ProductDetailsPage } from "@/pages/ProductDetailsPage";
import { CartPage } from "@/pages/CartPage";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { OrderSuccessPage } from "@/pages/OrderSuccessPage";
import { TrackOrderPage } from "@/pages/TrackOrderPage";
import { ContactPage } from "@/pages/ContactPage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="product/:id" element={<ProductDetailsPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="order-success/:orderId" element={<OrderSuccessPage />} />
          <Route path="track-order" element={<TrackOrderPage />} />
          <Route path="contact" element={<ContactPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
