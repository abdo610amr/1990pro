import express from "express";
import upload from "../middlewares/upload.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import {
  getCarouselItems,
  createCarouselItem,
  updateCarouselItem,
  deleteCarouselItem,
  reorderCarouselItem,
  toggleCarouselStatus,
} from "../controllers/websiteController.js";

const router = express.Router();

// Public — fetch carousel items (use ?active=true for storefront)
router.get("/", getCarouselItems);

// Admin-only mutations
router.post("/", requireAuth, requireRole("admin"), upload.single("imageFile"), createCarouselItem);
router.put("/:id", requireAuth, requireRole("admin"), upload.single("imageFile"), updateCarouselItem);
router.delete("/:id", requireAuth, requireRole("admin"), deleteCarouselItem);
router.patch("/:id/reorder", requireAuth, requireRole("admin"), reorderCarouselItem);
router.patch("/:id/status", requireAuth, requireRole("admin"), toggleCarouselStatus);

export default router;
