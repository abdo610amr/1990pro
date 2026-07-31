export const DEFAULT_LOW_STOCK_THRESHOLD = 5;

export const VARIANT_TYPES = {
  "perfume-volume": { label: "Volume", presets: ["30ml", "50ml", "100ml"] },
  "fashion-size": { label: "Size", presets: ["S", "M", "L", "XL", "XXL"] },
  "shoe-size": { label: "Shoe Size", presets: ["36", "37", "38", "39", "40", "41", "42", "43", "44"] },
  custom: { label: "Option", presets: [] },
};

export function normalizeVariant(variant) {
  return {
    label: String(variant.label ?? variant.size ?? ""),
    price: Number(variant.price) || 0,
    stock: Number(variant.stock) ?? 0,
    sku: variant.sku ?? null,
  };
}

export function variantsToSizes(variants) {
  return variants.map((v) => ({ size: v.label, price: v.price, stock: v.stock, sku: v.sku }));
}

export function sizesToVariants(sizes) {
  return sizes.map((s) =>
    normalizeVariant({
      label: s.size ?? s.label,
      price: s.price,
      stock: s.stock ?? 0,
      sku: s.sku,
    })
  );
}

export function getProductVariants(product) {
  if (Array.isArray(product.variants) && product.variants.length) {
    return product.variants.map(normalizeVariant);
  }
  if (Array.isArray(product.sizes) && product.sizes.length) {
    return sizesToVariants(product.sizes);
  }
  return [];
}

export function getTotalStock(product) {
  return getProductVariants(product).reduce((sum, v) => sum + v.stock, 0);
}

export function getStockStatus(product) {
  const variants = getProductVariants(product);
  if (!variants.length) return "in_stock";
  const total = variants.reduce((sum, v) => sum + v.stock, 0);
  if (total <= 0) return "sold_out";
  const threshold = Number(product.lowStockThreshold) || DEFAULT_LOW_STOCK_THRESHOLD;
  if (variants.some((v) => v.stock > 0 && v.stock <= threshold)) return "low_stock";
  return "in_stock";
}

export function findVariant(product, label) {
  return getProductVariants(product).find(
    (v) => v.label.toLowerCase() === String(label).toLowerCase()
  );
}

export function decrementStock(products, items) {
  const updated = products.map((p) => ({ ...p }));
  const errors = [];

  for (const item of items) {
    const productId = Number(item.productId ?? item.product_id);
    const label = item.variant ?? item.size ?? item.label;
    const qty = Number(item.quantity) || 0;

    if (!productId || !label || qty <= 0) continue;

    const index = updated.findIndex((p) => p.id === productId);
    if (index === -1) {
      errors.push(`Product #${productId} not found`);
      continue;
    }

    const product = updated[index];
    const variants = getProductVariants(product);
    const variantIndex = variants.findIndex(
      (v) => v.label.toLowerCase() === String(label).toLowerCase()
    );

    if (variantIndex === -1) {
      errors.push(`${product.name}: variant "${label}" not found`);
      continue;
    }

    if (variants[variantIndex].stock < qty) {
      errors.push(
        `${product.name} (${label}): only ${variants[variantIndex].stock} in stock`
      );
      continue;
    }

    variants[variantIndex] = {
      ...variants[variantIndex],
      stock: variants[variantIndex].stock - qty,
    };

    updated[index] = {
      ...product,
      variants,
      sizes: variantsToSizes(variants),
    };
  }

  return { products: updated, errors };
}

/** Restore stock for cancelled / returned order items (inverse of decrementStock). */
export function restoreStock(products, items) {
  const updated = products.map((p) => ({ ...p }));
  const errors = [];

  for (const item of items) {
    const productId = Number(item.productId ?? item.product_id);
    const label = item.variant ?? item.size ?? item.label;
    const qty = Number(item.quantity) || 0;

    if (!productId || !label || qty <= 0) continue;

    const index = updated.findIndex((p) => p.id === productId);
    if (index === -1) {
      errors.push(`Product #${productId} not found`);
      continue;
    }

    const product = updated[index];
    const variants = getProductVariants(product);
    const variantIndex = variants.findIndex(
      (v) => v.label.toLowerCase() === String(label).toLowerCase()
    );

    if (variantIndex === -1) {
      errors.push(`${product.name}: variant "${label}" not found`);
      continue;
    }

    variants[variantIndex] = {
      ...variants[variantIndex],
      stock: variants[variantIndex].stock + qty,
    };

    updated[index] = {
      ...product,
      variants,
      sizes: variantsToSizes(variants),
    };
  }

  return { products: updated, errors };
}
