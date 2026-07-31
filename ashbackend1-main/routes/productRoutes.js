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
    brandId: Number(product.brandId) || 1,
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
        product.description.toLowerCase().includes(query) ||
        product.tags.some((tag) => String(tag).toLowerCase().includes(query));
      return (
        matchesQuery &&
        (!categoryId || product.categoryId === Number(categoryId)) &&
        (!brandId || product.brandId === Number(brandId)) &&
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
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const { name, description, tags, brandId, productType } = req.body;
      const variantData = parseVariantsFromBody(req.body);

      let coverUrl = "";

      if (req.files["cover"]) {
        const file = req.files["cover"][0];
        coverUrl = await saveUploadedFile(
          file.buffer,
          "products",
          `cover-${file.originalname}`
        );
      }

      let galleryUrls = [];

      if (req.files["gallery"]) {
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
      const products = await readCollection("products");

      const newProduct = {
        id: getNextId(products),
        name,
        description,
        coverImage: coverUrl,
        gallery: galleryUrls,
        brandId: Number(brandId) || 1,
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
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, tags, brandId, productType } = req.body;
      const productId = Number(id);
      const variantData = parseVariantsFromBody(req.body);

      const products = await readCollection("products");
      const index = products.findIndex((p) => p.id === productId);

      if (index === -1) {
        return res.status(404).json({ message: "Not found" });
      }

      const parsedTags = parseJsonField(tags, []);

      const updated = {
        ...products[index],
        name,
        description,
        brandId: Number(brandId) || Number(products[index].brandId) || 1,
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

router.patch("/:id/inventory", async (req, res) => {
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

router.delete("/:id", async (req, res) => {
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
