import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { AnnouncementBar } from "./AnnouncementBar";
import { CartDrawer } from "@/components/cart/CartDrawer";

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
