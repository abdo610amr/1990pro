import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { StoreSettingsProvider } from "@/providers/StoreSettingsProvider";
import { StoreSettingsGate } from "@/components/brand/StoreSettingsGate";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StoreSettingsProvider>
      <StoreSettingsGate>
        <App />
      </StoreSettingsGate>
    </StoreSettingsProvider>
  </StrictMode>
);
