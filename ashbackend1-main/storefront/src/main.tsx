import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { StoreSettingsProvider } from "./providers/StoreSettingsProvider";
import { StoreSettingsGate } from "./components/brand/StoreSettingsGate";
import { CartProvider } from "./context/CartContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StoreSettingsProvider>
      <StoreSettingsGate>
        <CartProvider>
          <App />
        </CartProvider>
      </StoreSettingsGate>
    </StoreSettingsProvider>
  </StrictMode>
);
