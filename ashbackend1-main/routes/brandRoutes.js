import express from "express";
import upload from "../middlewares/upload.js";
import {
  getNextId,
  readCollection,
  writeCollection,
} from "../lib/jsonStore.js";
import { saveUploadedFile } from "../lib/fileStorage.js";

const router = express.Router();

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeBrand(brand) {
  return {
    ...brand,
    categories: Array.isArray(brand.categories) ? brand.categories : [],
    socialLinks: brand.socialLinks ?? {},
    followers: Number(brand.followers) || 0,
    rating: Number(brand.rating) || 0,
    featured: brand.featured === true,
    active: brand.active !== false,
  };
}

router.get("/", async (req, res) => {
  try {
    const brands = await readCollection("brands");
    res.json(brands.map(normalizeBrand).filter((brand) => brand.active));
  } catch {
    res.status(500).json({ message: "Failed to fetch brands" });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const brands = await readCollection("brands");
    const brand = brands.find(
      (item) => item.slug === req.params.slug || item.id === Number(req.params.slug)
    );
    if (!brand) return res.status(404).json({ message: "Brand not found" });
    res.json(normalizeBrand(brand));
  } catch {
    res.status(500).json({ message: "Failed to fetch brand" });
  }
});

router.post(
  "/",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const name = String(req.body.name ?? "").trim();
      if (!name) return res.status(400).json({ message: "Name is required" });

      const brands = await readCollection("brands");
      const slug = slugify(req.body.slug || name);
      if (brands.some((brand) => brand.slug === slug)) {
        return res.status(409).json({ message: "Brand already exists" });
      }

      const logoFile = req.files?.logo?.[0];
      const coverFile = req.files?.cover?.[0];
      const brand = normalizeBrand({
        id: getNextId(brands),
        slug,
        name,
        logo: logoFile
          ? await saveUploadedFile(logoFile.buffer, "brands", logoFile.originalname)
          : req.body.logo ?? "",
        coverImage: coverFile
          ? await saveUploadedFile(coverFile.buffer, "brands", coverFile.originalname)
          : req.body.coverImage ?? "",
        story: String(req.body.story ?? ""),
        about: String(req.body.about ?? ""),
        categories: parseField(req.body.categories, []),
        socialLinks: parseField(req.body.socialLinks, {}),
        followers: Number(req.body.followers) || 0,
        rating: Number(req.body.rating) || 0,
        featured: req.body.featured === true || req.body.featured === "true",
        active: req.body.active !== false && req.body.active !== "false",
        createdAt: new Date().toISOString(),
      });

      brands.push(brand);
      await writeCollection("brands", brands);
      res.status(201).json(brand);
    } catch (error) {
      console.error("CREATE BRAND ERROR:", error);
      res.status(500).json({ message: "Failed to create brand" });
    }
  }
);

router.put(
  "/:id",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const brands = await readCollection("brands");
      const index = brands.findIndex((brand) => brand.id === Number(req.params.id));
      if (index === -1) return res.status(404).json({ message: "Brand not found" });

      const current = brands[index];
      const logoFile = req.files?.logo?.[0];
      const coverFile = req.files?.cover?.[0];
      brands[index] = normalizeBrand({
        ...current,
        ...req.body,
        id: current.id,
        slug: req.body.slug
          ? slugify(req.body.slug)
          : req.body.name
            ? slugify(req.body.name)
            : current.slug,
        categories:
          req.body.categories === undefined
            ? current.categories
            : parseField(req.body.categories, []),
        socialLinks:
          req.body.socialLinks === undefined
            ? current.socialLinks
            : parseField(req.body.socialLinks, {}),
        logo: logoFile
          ? await saveUploadedFile(logoFile.buffer, "brands", logoFile.originalname)
          : req.body.logo ?? current.logo,
        coverImage: coverFile
          ? await saveUploadedFile(coverFile.buffer, "brands", coverFile.originalname)
          : req.body.coverImage ?? current.coverImage,
        updatedAt: new Date().toISOString(),
      });

      await writeCollection("brands", brands);
      res.json(brands[index]);
    } catch (error) {
      console.error("UPDATE BRAND ERROR:", error);
      res.status(500).json({ message: "Failed to update brand" });
    }
  }
);

router.delete("/:id", async (req, res) => {
  try {
    const brands = await readCollection("brands");
    const index = brands.findIndex((brand) => brand.id === Number(req.params.id));
    if (index === -1) return res.status(404).json({ message: "Brand not found" });
    brands[index] = { ...brands[index], active: false, updatedAt: new Date().toISOString() };
    await writeCollection("brands", brands);
    res.json({ message: "Brand deactivated" });
  } catch {
    res.status(500).json({ message: "Failed to deactivate brand" });
  }
});

function parseField(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export default router;
