import express from "express";
import {
  getPlatform,
  updatePlatform,
  seedFashionDemo,
  seedPerfumeDemo,
} from "../controllers/platformController.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getPlatform);
router.put("/", requireAuth, requireRole("admin"), updatePlatform);
router.post("/demo/fashion", requireAuth, requireRole("admin"), seedFashionDemo);
router.post("/demo/perfume", requireAuth, requireRole("admin"), seedPerfumeDemo);

export default router;
