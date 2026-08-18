import express from "express";
import upload from "../middlewares/upload.js";
import {
  readCollection,
  writeCollection,
  getNextId,
  parseJsonField,
} from "../lib/jsonStore.js";
import { saveUploadedFile } from "../lib/fileStorage.js";
import {
  DEFAULT_LOW_STOCK_THRESHOLD,
  getProductVariants,
  getStockStatus,
  normalizeVariant,
  sizesToVariants,
  variantsToSizes,
} from "../lib/inventory.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import { generateBarcode, normalizeBrand } from "../lib/brandHelper.js";

const router = express.Router();

function formatProduct(product) {
  const variants = getProductVariants(product);
  const sizes = variantsToSizes(variants);

  return {
    ...product,
    variants,
    sizes,
    gallery: parseJsonField(product.gallery, []),
    tags: parseJsonField(product.tags, []),
    categoryId: product.categoryId ?? null,
    brandId: Number(product.brandId ?? product.brand_id) || 1,
    brand_id: Number(product.brandId ?? product.brand_id) || 1,
    brandName: product.brandName ?? product.brand_name ?? "1990",
    brand_name: product.brandName ?? product.brand_name ?? "1990",
    brandLogo: product.brandLogo ?? "/uploads/brand-logo.png",
    barcode: product.barcode ?? "",
    commissionPercentage: Number(product.commissionPercentage ?? product.commission_percentage) || 0,
    commission_percentage: Number(product.commissionPercentage ?? product.commission_percentage) || 0,
    productType: product.productType === "showroom" ? "showroom" : "originals",
    variantType: product.variantType ?? "perfume-volume",
    variantLabel: product.variantLabel ?? "Volume",
    lowStockThreshold: Number(product.lowStockThreshold) || DEFAULT_LOW_STOCK_THRESHOLD,
    stockStatus: getStockStatus({ ...product, variants }),
  };
}

function parseVariantsFromBody(body) {
  const { variants, sizes, variantType, variantLabel, lowStockThreshold, categoryId } =
    body;

  let parsed = parseJsonField(variants, null);
  if (!parsed?.length) {
    parsed = sizesToVariants(parseJsonField(sizes, []));
  }

  return {
    variants: parsed.map(normalizeVariant),
    variantType: variantType ?? "perfume-volume",
    variantLabel: variantLabel ?? "Volume",
    lowStockThreshold: Number(lowStockThreshold) || DEFAULT_LOW_STOCK_THRESHOLD,
    categoryId: categoryId ? Number(categoryId) : null,
  };
}

router.get("/", async (req, res) => {
  try {
    const products = await readCollection("products");
    const formatted = products.map(formatProduct).sort((a, b) => b.id - a.id);
    res.json(formatted);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/search", async (req, res) => {
  try {
    const {
      q = "",
      categoryId,
      brandId,
      productType,
      availability,
      size,
      minPrice,
      maxPrice,
      sort = "newest",
      page = 1,
      limit = 12,
    } = req.query;
    const query = String(q).trim().toLowerCase();
    const products = (await readCollection("products")).map(formatProduct);

    let filtered = products.filter((product) => {
      const prices = product.variants.map((variant) => Number(variant.price));
      const productPrice = prices.length ? Math.min(...prices) : 0;
      const matchesQuery =
        !query ||
        product.name.toLowerCase().includes(query) ||
        (product.barcode && product.barcode.toLowerCase().includes(query)) ||
        (product.brandName && product.brandName.toLowerCase().includes(query)) ||
        product.description.toLowerCase().includes(query) ||
        product.tags.some((tag) => String(tag).toLowerCase().includes(query));

      const targetBrandId = brandId ? Number(brandId) : null;
      return (
        matchesQuery &&
        (!categoryId || product.categoryId === Number(categoryId)) &&
        (!targetBrandId || product.brandId === targetBrandId) &&
        (!productType || product.productType === productType) &&
        (availability !== "in-stock" || product.stockStatus !== "sold_out") &&
        (!size ||
          product.variants.some(
            (variant) =>
              variant.label.toLowerCase() === String(size).toLowerCase() &&
              variant.stock > 0
          )) &&
        (minPrice === undefined || productPrice >= Number(minPrice)) &&
        (maxPrice === undefined || productPrice <= Number(maxPrice))
      );
    });

    const getPrice = (product) => {
      const prices = product.variants.map((variant) => Number(variant.price));
      return prices.length ? Math.min(...prices) : 0;
    };
    if (sort === "price-asc") filtered.sort((a, b) => getPrice(a) - getPrice(b));
    else if (sort === "price-desc") filtered.sort((a, b) => getPrice(b) - getPrice(a));
    else if (sort === "name-asc") filtered.sort((a, b) => a.name.localeCompare(b.name));
    else filtered.sort((a, b) => b.id - a.id);

    const currentPage = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(limit) || 12));
    const total = filtered.length;
    const start = (currentPage - 1) * pageSize;
    res.json({
      items: filtered.slice(start, start + pageSize),
      total,
      page: currentPage,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("PRODUCT SEARCH ERROR:", error);
    res.status(500).json({ message: "Failed to search products" });
  }
});

router.get("/inventory", async (req, res) => {
  try {
    const products = await readCollection("products");
    const inventory = products.map(formatProduct).map((p) => ({
      id: p.id,
      name: p.name,
      coverImage: p.coverImage,
      categoryId: p.categoryId,
      brandId: p.brandId,
      brandName: p.brandName,
      barcode: p.barcode,
      variants: p.variants,
      lowStockThreshold: p.lowStockThreshold,
      stockStatus: p.stockStatus,
      totalStock: p.variants.reduce((sum, v) => sum + v.stock, 0),
    }));
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch inventory" });
  }
});

router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const { name, description, tags, brandId, brand_id, barcode, productType } = req.body;
      const variantData = parseVariantsFromBody(req.body);

      const targetBrandId = Number(brandId ?? brand_id);
      if (!targetBrandId) {
        return res.status(400).json({ message: "Brand is required for products" });
      }

      const brands = await readCollection("brands");
      const brandObj = brands.find((b) => b.id === targetBrandId);
      if (!brandObj) {
        return res.status(400).json({ message: "Invalid brand ID specified" });
      }
      if (brandObj.status === "disabled" || brandObj.active === false) {
        return res.status(400).json({ message: `Brand "${brandObj.name}" is currently disabled` });
      }

      const products = await readCollection("products");

      // Auto-generate barcode if not specified
      let finalBarcode = String(barcode ?? "").trim();
      if (!finalBarcode) {
        const brandProducts = products.filter((p) => Number(p.brandId ?? p.brand_id) === targetBrandId);
        const prefix = brandObj.barcodePrefix || brandObj.name.slice(0, 3).toUpperCase();
        finalBarcode = generateBarcode(prefix, brandProducts.length + 1);
      }

      let coverUrl = "";
      if (req.files?.["cover"]) {
        const file = req.files["cover"][0];
        coverUrl = await saveUploadedFile(
          file.buffer,
          "products",
          `cover-${file.originalname}`
        );
      }

      let galleryUrls = [];
      if (req.files?.["gallery"]) {
        for (const file of req.files["gallery"]) {
          const url = await saveUploadedFile(
            file.buffer,
            "products",
            `gallery-${file.originalname}`
          );
          galleryUrls.push(url);
        }
      }

      const parsedTags = parseJsonField(tags, []);

      const newProduct = {
        id: getNextId(products),
        name,
        description,
        coverImage: coverUrl,
        gallery: galleryUrls,
        brandId: targetBrandId,
        brand_id: targetBrandId,
        brandName: brandObj.name,
        brand_name: brandObj.name,
        brandLogo: brandObj.logo || "/uploads/brand-logo.png",
        barcode: finalBarcode,
        commissionPercentage: Number(brandObj.commissionPercentage) || 0,
        commission_percentage: Number(brandObj.commissionPercentage) || 0,
        productType: productType === "showroom" ? "showroom" : "originals",
        ...variantData,
        sizes: variantsToSizes(variantData.variants),
        tags: parsedTags,
      };

      products.push(newProduct);
      await writeCollection("products", products);

      res.json({ message: "Product added ✅", product: formatProduct(newProduct) });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }
);

router.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, tags, brandId, brand_id, barcode, productType } = req.body;
      const productId = Number(id);
      const variantData = parseVariantsFromBody(req.body);

      const products = await readCollection("products");
      const index = products.findIndex((p) => p.id === productId);

      if (index === -1) {
        return res.status(404).json({ message: "Not found" });
      }

      const targetBrandId = Number(brandId ?? brand_id ?? products[index].brandId ?? products[index].brand_id) || 1;
      const brands = await readCollection("brands");
      const brandObj = brands.find((b) => b.id === targetBrandId) || brands[0];

      let finalBarcode = String(barcode ?? products[index].barcode ?? "").trim();
      if (!finalBarcode) {
        const brandProducts = products.filter((p) => Number(p.brandId ?? p.brand_id) === targetBrandId);
        const prefix = brandObj?.barcodePrefix || brandObj?.name?.slice(0, 3)?.toUpperCase() || "BRD";
        finalBarcode = generateBarcode(prefix, brandProducts.length + 1);
      }

      const parsedTags = parseJsonField(tags, []);

      const updated = {
        ...products[index],
        name,
        description,
        brandId: targetBrandId,
        brand_id: targetBrandId,
        brandName: brandObj ? brandObj.name : "1990",
        brand_name: brandObj ? brandObj.name : "1990",
        brandLogo: brandObj ? (brandObj.logo || "/uploads/brand-logo.png") : "/uploads/brand-logo.png",
        barcode: finalBarcode,
        commissionPercentage: brandObj ? (Number(brandObj.commissionPercentage) || 0) : 0,
        commission_percentage: brandObj ? (Number(brandObj.commissionPercentage) || 0) : 0,
        productType:
          productType === undefined
            ? products[index].productType ?? "originals"
            : productType === "showroom"
              ? "showroom"
              : "originals",
        ...variantData,
        sizes: variantsToSizes(variantData.variants),
        tags: parsedTags,
      };

      if (req.files["cover"]) {
        const file = req.files["cover"][0];
        updated.coverImage = await saveUploadedFile(
          file.buffer,
          "products",
          `cover-${file.originalname}`
        );
      }

      if (req.files["gallery"]) {
        const galleryUrls = [];

        for (const file of req.files["gallery"]) {
          const url = await saveUploadedFile(
            file.buffer,
            "products",
            `gallery-${file.originalname}`
          );
          galleryUrls.push(url);
        }

        updated.gallery = galleryUrls;
      }

      products[index] = updated;
      await writeCollection("products", products);

      res.json({ message: "Updated ✅", product: formatProduct(updated) });
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

router.patch("/:id/inventory", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const { variants, lowStockThreshold } = req.body;

    const products = await readCollection("products");
    const index = products.findIndex((p) => p.id === productId);

    if (index === -1) {
      return res.status(404).json({ message: "Not found" });
    }

    const parsedVariants = parseJsonField(variants, []).map(normalizeVariant);

    products[index] = {
      ...products[index],
      variants: parsedVariants,
      sizes: variantsToSizes(parsedVariants),
      lowStockThreshold:
        Number(lowStockThreshold) ||
        products[index].lowStockThreshold ||
        DEFAULT_LOW_STOCK_THRESHOLD,
    };

    await writeCollection("products", products);
    res.json({ message: "Inventory updated ✅", product: formatProduct(products[index]) });
  } catch (err) {
    res.status(500).json({ message: "Failed to update inventory" });
  }
});

router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const products = await readCollection("products");
    const filtered = products.filter((p) => p.id !== productId);

    if (filtered.length === products.length) {
      return res.status(404).json({ message: "Not found" });
    }

    await writeCollection("products", filtered);
    res.json({ message: "Deleted ✅" });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const products = await readCollection("products");
    const product = products.find((p) => p.id === productId);

    if (!product) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(formatProduct(product));
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;
