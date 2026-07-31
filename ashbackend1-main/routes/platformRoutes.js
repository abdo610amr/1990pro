import express from "express";
import {
  getPlatform,
  updatePlatform,
  seedFashionDemo,
  seedPerfumeDemo,
} from "../controllers/platformController.js";

const router = express.Router();

router.get("/", getPlatform);
router.put("/", updatePlatform);
router.post("/demo/fashion", seedFashionDemo);
router.post("/demo/perfume", seedPerfumeDemo);

export default router;
