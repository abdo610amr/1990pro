import express from "express";
import upload from "../middlewares/upload.js";
import { getPopup, updatePopup } from "../controllers/popupController.js";

const router = express.Router();

router.get("/", getPopup);
router.put("/", upload.single("imageFile"), updatePopup);

export default router;
