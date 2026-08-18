import express from "express";
import {
  createPromo,
  getAllPromos,
  deletePromo,
  applyPromo
} from "../controllers/promoController.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", requireAuth, requireRole("admin"), createPromo);
router.get("/", getAllPromos);
router.delete("/:id", requireAuth, requireRole("admin"), deletePromo);
router.post("/apply", applyPromo);

export default router;