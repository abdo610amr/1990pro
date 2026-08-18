import express from "express";
import upload from "../middlewares/upload.js";
import {
  getNextId,
  readCollection,
  writeCollection,
} from "../lib/jsonStore.js";
import { saveUploadedFile } from "../lib/fileStorage.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import { normalizeBrand, formatBarcodePrefix } from "../lib/brandHelper.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const includeAll = req.query.all === "true" || req.query.includeDisabled === "true";
    const [brands, products] = await Promise.all([
      readCollection("brands"),
      readCollection("products"),
    ]);

    const productCounts = new Map();
    for (const p of products) {
      const bId = Number(p.brandId ?? p.brand_id) || 1;
      productCounts.set(bId, (productCounts.get(bId) || 0) + 1);
    }

    const normalized = brands.map((b) => {
      const norm = normalizeBrand(b);
      return {
        ...norm,
        productCount: productCounts.get(norm.id) || 0,
      };
    });

    const result = includeAll
      ? normalized
      : normalized.filter((b) => b.status === "active" && b.active !== false);

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch brands" });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const [brands, products] = await Promise.all([
      readCollection("brands"),
      readCollection("products"),
    ]);

    const targetSlug = String(req.params.slug).trim().toLowerCase();
    const brand = brands.find(
      (item) =>
        item.slug === targetSlug ||
        item.id === Number(targetSlug) ||
        String(item.name).toLowerCase() === targetSlug
    );

    if (!brand) return res.status(404).json({ message: "Brand not found" });

    const norm = normalizeBrand(brand);
    const brandProducts = products.filter(
      (p) => Number(p.brandId ?? p.brand_id) === norm.id
    );

    res.json({
      ...norm,
      productCount: brandProducts.length,
      products: brandProducts,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch brand" });
  }
});

router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const name = String(req.body.name ?? "").trim();
      if (!name) return res.status(400).json({ message: "Name is required" });

      const brands = await readCollection("brands");
      const norm = normalizeBrand({ name, slug: req.body.slug });

      if (brands.some((b) => b.slug === norm.slug)) {
        return res.status(409).json({ message: "Brand slug already exists" });
      }

      const logoFile = req.files?.logo?.[0];
      const coverFile = req.files?.cover?.[0];

      const newBrand = normalizeBrand({
        id: getNextId(brands),
        name,
        slug: norm.slug,
        barcodePrefix: formatBarcodePrefix(name, req.body.barcodePrefix),
        commissionPercentage: Number(req.body.commissionPercentage ?? req.body.commission_percentage) || 0,
        status: req.body.status === "disabled" ? "disabled" : "active",
        description: String(req.body.description ?? req.body.story ?? req.body.about ?? ""),
        story: String(req.body.story ?? req.body.description ?? ""),
        about: String(req.body.about ?? req.body.description ?? ""),
        contactPerson: String(req.body.contactPerson ?? req.body.contact_person ?? ""),
        phone: String(req.body.phone ?? ""),
        email: String(req.body.email ?? ""),
        address: String(req.body.address ?? ""),
        notes: String(req.body.notes ?? ""),
        logo: logoFile
          ? await saveUploadedFile(logoFile.buffer, "brands", logoFile.originalname)
          : req.body.logo ?? "/uploads/brand-logo.png",
        coverImage: coverFile
          ? await saveUploadedFile(coverFile.buffer, "brands", coverFile.originalname)
          : req.body.coverImage ?? "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      brands.push(newBrand);
      await writeCollection("brands", brands);
      res.status(201).json(newBrand);
    } catch (error) {
      console.error("CREATE BRAND ERROR:", error);
      res.status(500).json({ message: "Failed to create brand" });
    }
  }
);

router.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const brandId = Number(req.params.id);
      const brands = await readCollection("brands");
      const index = brands.findIndex((b) => b.id === brandId);
      if (index === -1) return res.status(404).json({ message: "Brand not found" });

      const current = brands[index];
      const logoFile = req.files?.logo?.[0];
      const coverFile = req.files?.cover?.[0];
      const name = String(req.body.name ?? current.name).trim();

      const updated = normalizeBrand({
        ...current,
        ...req.body,
        id: current.id,
        name,
        slug: req.body.slug ? normalizeBrand({ name: req.body.slug }).slug : current.slug,
        barcodePrefix: formatBarcodePrefix(name, req.body.barcodePrefix ?? current.barcodePrefix),
        commissionPercentage:
          req.body.commissionPercentage !== undefined
            ? Number(req.body.commissionPercentage) || 0
            : Number(req.body.commission_percentage) || Number(current.commissionPercentage) || 0,
        status: req.body.status !== undefined ? (req.body.status === "disabled" ? "disabled" : "active") : current.status,
        logo: logoFile
          ? await saveUploadedFile(logoFile.buffer, "brands", logoFile.originalname)
          : req.body.logo ?? current.logo,
        coverImage: coverFile
          ? await saveUploadedFile(coverFile.buffer, "brands", coverFile.originalname)
          : req.body.coverImage ?? current.coverImage,
        updatedAt: new Date().toISOString(),
      });

      brands[index] = updated;
      await writeCollection("brands", brands);
      res.json(updated);
    } catch (error) {
      console.error("UPDATE BRAND ERROR:", error);
      res.status(500).json({ message: "Failed to update brand" });
    }
  }
);

router.patch("/:id/status", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const brandId = Number(req.params.id);
    const { status } = req.body;
    if (!["active", "disabled"].includes(status)) {
      return res.status(400).json({ message: 'Status must be "active" or "disabled"' });
    }

    const brands = await readCollection("brands");
    const index = brands.findIndex((b) => b.id === brandId);
    if (index === -1) return res.status(404).json({ message: "Brand not found" });

    brands[index].status = status;
    brands[index].active = status === "active";
    brands[index].updatedAt = new Date().toISOString();

    await writeCollection("brands", brands);
    res.json(normalizeBrand(brands[index]));
  } catch {
    res.status(500).json({ message: "Failed to update brand status" });
  }
});

router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const brandId = Number(req.params.id);
    const brands = await readCollection("brands");
    const index = brands.findIndex((b) => b.id === brandId);
    if (index === -1) return res.status(404).json({ message: "Brand not found" });

    brands[index].status = "disabled";
    brands[index].active = false;
    brands[index].updatedAt = new Date().toISOString();

    await writeCollection("brands", brands);
    res.json({ message: "Brand deactivated" });
  } catch {
    res.status(500).json({ message: "Failed to deactivate brand" });
  }
});

export default router;
