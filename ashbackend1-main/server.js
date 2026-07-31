import "./lib/loadEnv.js"; // populate process.env from .env before anything else

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import promoRoutes from "./routes/promoRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import popupRoutes from "./routes/popupRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import platformRoutes from "./routes/platformRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import brandRoutes from "./routes/brandRoutes.js";
import { ensureUploadDirs } from "./lib/fileStorage.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/promo", promoRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/popup", popupRoutes);
app.use("/api/announcement", announcementRoutes);
app.use("/api/platform", platformRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/brands", brandRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

const PORT = Number(process.env.PORT) || 5000;

await ensureUploadDirs();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("Using local JSON database (data/) — no MySQL or Supabase required");
});
