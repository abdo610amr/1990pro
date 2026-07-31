import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("react-router") || id.includes("react-dom") || id.includes("/react/")) {
            return "react-core";
          }
          if (
            id.includes("framer-motion") ||
            id.includes("zustand") ||
            id.includes("@tanstack/react-query")
          ) {
            return "motion-state";
          }
          if (id.includes("@radix-ui")) {
            return "ui-primitives";
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
