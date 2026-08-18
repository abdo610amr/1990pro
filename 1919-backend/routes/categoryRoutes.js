import express from "express";
import {
  readCollection,
  writeCollection,
  getNextId,
} from "../lib/jsonStore.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = express.Router();

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

router.get("/", async (req, res) => {
  try {
    const categories = await readCollection("categories");
    res.json([...categories].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const categories = await readCollection("categories");
    const category = categories.find((c) => c.id === id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch category" });
  }
});

router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { name, description, image, sortOrder, active } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const categories = await readCollection("categories");
    const slug = slugify(name);

    if (categories.some((c) => c.slug === slug)) {
      return res.status(400).json({ message: "Category slug already exists" });
    }

    const newCategory = {
      id: getNextId(categories),
      name: name.trim(),
      slug,
      description: description?.trim() ?? "",
      image: image ?? null,
      sortOrder: Number(sortOrder) || categories.length + 1,
      active: active !== false,
    };

    categories.push(newCategory);
    await writeCollection("categories", categories);
    res.json(newCategory);
  } catch (err) {
    res.status(500).json({ message: "Failed to create category" });
  }
});

router.put("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, description, image, sortOrder, active } = req.body;
    const categories = await readCollection("categories");
    const index = categories.findIndex((c) => c.id === id);

    if (index === -1) {
      return res.status(404).json({ message: "Category not found" });
    }

    const updated = { ...categories[index] };

    if (name?.trim()) {
      const slug = slugify(name);
      if (categories.some((c) => c.slug === slug && c.id !== id)) {
        return res.status(400).json({ message: "Category slug already exists" });
      }
      updated.name = name.trim();
      updated.slug = slug;
    }

    if (description !== undefined) updated.description = description?.trim() ?? "";
    if (image !== undefined) updated.image = image;
    if (sortOrder !== undefined) updated.sortOrder = Number(sortOrder);
    if (active !== undefined) updated.active = Boolean(active);

    categories[index] = updated;
    await writeCollection("categories", categories);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update category" });
  }
});

router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const categories = await readCollection("categories");
    const filtered = categories.filter((c) => c.id !== id);

    if (filtered.length === categories.length) {
      return res.status(404).json({ message: "Category not found" });
    }

    await writeCollection("categories", filtered);
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete category" });
  }
});

export default router;
