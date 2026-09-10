import express from "express";
import {
  readCollection,
  writeCollection,
  getNextId,
} from "../lib/jsonStore.js";

const router = express.Router();

/* ================= ADD ================= */
router.post("/", async (req, res) => {
  try {
    const { product_id, name, rating, comment } = req.body;

    console.log("BODY:", req.body);

    if (!product_id || !name || !rating) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const reviews = await readCollection("reviews");
    const newReview = {
      id: getNextId(reviews),
      product_id: Number(product_id),
      name,
      rating: Number(rating),
      comment: comment || null,
      createdAt: new Date().toISOString(),
    };

    reviews.push(newReview);
    await writeCollection("reviews", reviews);

    res.json({ message: "Review added ✅" });
  } catch (err) {
    console.log("REVIEW ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ================= GET ALL ================= */
router.get("/", async (req, res) => {
  try {
    const reviews = await readCollection("reviews");
    const sorted = [...reviews].sort((a, b) => b.id - a.id);

    res.json(sorted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= GET BY PRODUCT ================= */
router.get("/product/:id", async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const reviews = await readCollection("reviews");
    const filtered = reviews
      .filter((r) => r.product_id === productId)
      .sort((a, b) => b.id - a.id);

    res.json(filtered);
  } catch (err) {
    console.log("REVIEW ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ================= DELETE ================= */
router.delete("/:id", async (req, res) => {
  try {
    const reviewId = Number(req.params.id);
    const reviews = await readCollection("reviews");
    const filtered = reviews.filter((r) => r.id !== reviewId);

    if (filtered.length === reviews.length) {
      return res.status(404).json({ message: "Review not found" });
    }

    await writeCollection("reviews", filtered);
    res.json({ message: "Review deleted 🗑️" });
  } catch (err) {
    console.log("REVIEW ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
