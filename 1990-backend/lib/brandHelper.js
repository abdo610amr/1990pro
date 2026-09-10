import { readCollection, writeCollection, getNextId } from "./jsonStore.js";

export function slugifyBrand(name) {
  return String(name ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatBarcodePrefix(name, explicitPrefix) {
  if (explicitPrefix && String(explicitPrefix).trim()) {
    return String(explicitPrefix).trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  }
  const clean = String(name ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!clean) return "BRD";
  if (clean.length <= 4) return clean;
  // Generate prefix from initials or first 3 chars
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    return words.map((w) => w[0]).join("").slice(0, 4);
  }
  return clean.slice(0, 3);
}

export function generateBarcode(prefix, index) {
  const cleanPrefix = (prefix || "BRD").toUpperCase();
  const numStr = String(index).padStart(6, "0");
  return `${cleanPrefix}-${numStr}`;
}

export function normalizeBrand(brand) {
  const name = String(brand.name ?? "").trim() || "Unknown Brand";
  const prefix = formatBarcodePrefix(name, brand.barcodePrefix);

  return {
    id: Number(brand.id) || 1,
    name,
    slug: brand.slug ? slugifyBrand(brand.slug) : slugifyBrand(name),
    logo: brand.logo || "/uploads/brand-logo.png",
    coverImage: brand.coverImage || "",
    barcodePrefix: prefix,
    commissionPercentage: Number(brand.commissionPercentage ?? brand.commission_percentage) || 0,
    status: brand.status === "disabled" || brand.active === false ? "disabled" : "active",
    active: brand.status === "disabled" || brand.active === false ? false : true,
    description: brand.description || brand.about || brand.story || "",
    story: brand.story || "",
    about: brand.about || "",
    contactPerson: brand.contactPerson || brand.contact_person || "",
    phone: brand.phone || "",
    email: brand.email || "",
    address: brand.address || "",
    notes: brand.notes || "",
    categories: Array.isArray(brand.categories) ? brand.categories : [],
    followers: Number(brand.followers) || 0,
    rating: Number(brand.rating) || 5,
    socialLinks: brand.socialLinks ?? {},
    featured: brand.featured === true,
    createdAt: brand.createdAt || "2026-08-08T00:00:00.000Z",
    updatedAt: brand.updatedAt || brand.createdAt || "2026-08-08T00:00:00.000Z",
  };
}

export async function migrateBrandsAndProducts() {
  try {
    let brands = await readCollection("brands");
    let brandsModified = false;

    if (!Array.isArray(brands) || brands.length === 0) {
      brands = [
        {
          id: 1,
          name: "1990",
          slug: "1990",
          logo: "/uploads/brand-logo.png",
          barcodePrefix: "1990",
          commissionPercentage: 0,
          status: "active",
          active: true,
          description: "1990 Official Brand",
        },
      ];
      brandsModified = true;
    }

    // Ensure Default Brand (id: 1) exists
    let defaultBrand = brands.find((b) => Number(b.id) === 1);
    if (!defaultBrand) {
      defaultBrand = {
        id: 1,
        name: "1990",
        slug: "1990",
        logo: "/uploads/brand-logo.png",
        barcodePrefix: "1990",
        commissionPercentage: 0,
        status: "active",
        active: true,
        description: "1990 Official Brand",
      };
      brands.unshift(defaultBrand);
      brandsModified = true;
    }

    const initialBrandsJson = JSON.stringify(brands);
    const normalizedBrands = brands.map(normalizeBrand);
    if (brandsModified || JSON.stringify(normalizedBrands) !== initialBrandsJson) {
      await writeCollection("brands", normalizedBrands);
    }

    const brandMap = new Map(normalizedBrands.map((b) => [b.id, b]));

    // Migrate products
    const products = await readCollection("products");
    const initialProductsJson = JSON.stringify(products);
    let productsModified = false;
    const brandCounters = new Map();

    for (const product of products) {
      let bId = Number(product.brandId ?? product.brand_id) || 1;
      let brand = brandMap.get(bId);
      if (!brand) {
        bId = 1;
        brand = brandMap.get(1);
      }

      if (product.brandId !== bId || product.brand_id !== bId) productsModified = true;
      product.brandId = bId;
      product.brand_id = bId;

      if (product.brandName !== brand.name) productsModified = true;
      product.brandName = brand.name;
      product.brand_name = brand.name;
      product.brandLogo = brand.logo;
      product.commissionPercentage = brand.commissionPercentage;
      product.commission_percentage = brand.commissionPercentage;

      const currentCounter = (brandCounters.get(bId) || 0) + 1;
      brandCounters.set(bId, currentCounter);

      if (!product.barcode || !String(product.barcode).trim()) {
        product.barcode = generateBarcode(brand.barcodePrefix, currentCounter);
        productsModified = true;
      }
    }

    if (productsModified && JSON.stringify(products) !== initialProductsJson) {
      await writeCollection("products", products);
    }

    console.log(`[Brand Migration] Verified ${normalizedBrands.length} brand(s) and ${products.length} product(s).`);
  } catch (err) {
    console.error("[Brand Migration Error]:", err);
  }
}
