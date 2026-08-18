import express from "express";
import {
  getAnnouncement,
  updateAnnouncement,
} from "../controllers/announcementController.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getAnnouncement);
router.put("/", requireAuth, requireRole("admin"), updateAnnouncement);

export default router;
