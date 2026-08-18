import {
  readDocument,
  writeDocument,
  writeCollection,
} from "../lib/jsonStore.js";
import {
  DEFAULT_PRODUCT_TYPE,
  getFashionDemoCategories,
  getFashionDemoProducts,
  getPerfumeDemoCategories,
  getPerfumeDemoProducts,
  resolvePlatformConfig,
} from "../lib/productTypeEngine.js";

const DEFAULT_PLATFORM = { productType: DEFAULT_PRODUCT_TYPE };

async function loadPlatformConfig() {
  const platform = await readDocument("platform", DEFAULT_PLATFORM);
  return resolvePlatformConfig(platform);
}

async function seedDemo(productType) {
  const categories =
    productType === "fashion"
      ? getFashionDemoCategories()
      : getPerfumeDemoCategories();
  const products =
    productType === "fashion"
      ? getFashionDemoProducts()
      : getPerfumeDemoProducts();

  await writeCollection("categories", categories);
  await writeCollection("products", products);
  await writeDocument("platform", { productType });

  return resolvePlatformConfig({ productType });
}

export const getPlatform = async (_req, res) => {
  try {
    const config = await loadPlatformConfig();
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch platform configuration" });
  }
};

export const updatePlatform = async (req, res) => {
  try {
    const { productType } = req.body;
    const current = await readDocument("platform", DEFAULT_PLATFORM);

    if (productType && !["perfume", "fashion"].includes(productType)) {
      return res.status(400).json({ message: "Invalid product type" });
    }

    const updated = {
      productType: productType ?? current.productType ?? DEFAULT_PRODUCT_TYPE,
    };

    await writeDocument("platform", updated);
    res.json(resolvePlatformConfig(updated));
  } catch (err) {
    res.status(500).json({ message: "Failed to update platform configuration" });
  }
};

export const seedFashionDemo = async (_req, res) => {
  try {
    const config = await seedDemo("fashion");
    res.json({
      message: "Fashion demo loaded successfully",
      productCount: getFashionDemoProducts().length,
      categoryCount: getFashionDemoCategories().length,
      config,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to load fashion demo" });
  }
};

export const seedPerfumeDemo = async (_req, res) => {
  try {
    const config = await seedDemo("perfume");
    res.json({
      message: "Perfume demo loaded successfully",
      productCount: getPerfumeDemoProducts().length,
      categoryCount: getPerfumeDemoCategories().length,
      config,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to load perfume demo" });
  }
};
