import express from "express";
import upload from "../middlewares/upload.js";
import { getPopup, updatePopup } from "../controllers/popupController.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getPopup);
router.put("/", requireAuth, requireRole("admin"), upload.single("imageFile"), updatePopup);

export default router;
