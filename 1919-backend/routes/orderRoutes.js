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
  decrementStock,
  restoreStock,
  findVariant,
  getProductVariants,
  DEFAULT_LOW_STOCK_THRESHOLD,
} from "../lib/inventory.js";
import * as notify from "../services/notificationService.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

async function restoreOrderStock(order) {
  if (!order || order.stockRestored) {
    return { restored: false, products: null, errors: [] };
  }
  const products = await readCollection("products");
  const stockItems = (order.items ?? []).map((item) => ({
    productId: item.productId ?? item.product_id,
    variant: item.variant ?? item.size,
    quantity: item.quantity,
  }));
  const { products: updatedProducts, errors } = restoreStock(products, stockItems);
  if (!errors.length) {
    await writeCollection("products", updatedProducts);
  }
  return { restored: errors.length === 0, products: updatedProducts, errors };
}

async function reDeductOrderStock(order) {
  const products = await readCollection("products");
  const stockItems = (order.items ?? []).map((item) => ({
    productId: item.productId ?? item.product_id,
    variant: item.variant ?? item.size,
    quantity: item.quantity,
  }));
  const { products: updatedProducts, errors } = decrementStock(products, stockItems);
  if (errors.length) {
    return { ok: false, errors };
  }
  await writeCollection("products", updatedProducts);
  return { ok: true, products: updatedProducts, errors: [] };
}

const router = express.Router();

async function checkStockAlerts(order, updatedProducts) {
  const lowItems = [];
  const outItems = [];

  for (const item of order.items) {
    if (!item.productId) continue;
    const product = updatedProducts.find((p) => p.id === Number(item.productId));
    if (!product) continue;

    const variant = getProductVariants(product).find(
      (v) => v.label.toLowerCase() === String(item.variant ?? item.size).toLowerCase()
    );
    if (!variant) continue;

    const threshold =
      Number(product.lowStockThreshold) || DEFAULT_LOW_STOCK_THRESHOLD;

    if (variant.stock <= 0) {
      outItems.push({ name: product.name, variant: variant.label, sku: variant.sku });
    } else if (variant.stock <= threshold) {
      lowItems.push({
        name: product.name,
        variant: variant.label,
        stock: variant.stock,
        threshold,
      });
    }
  }

  if (lowItems.length) await notify.notifyLowStock(lowItems);
  if (outItems.length) await notify.notifyOutOfStock(outItems);
}

/** Retail ERP workflow statuses. */
export const ORDER_STATUSES = [
  "pending",
  "preparing",
  "ready",
  "completed",
  "cancelled",
  "returned",
];

const ACTIVE_PIPELINE = new Set(["pending", "preparing", "ready"]);
const NO_RESTOCK_ON_DELETE = new Set(["completed", "cancelled", "returned"]);

function normalizeStatus(status) {
  const key = String(status ?? "")
    .trim()
    .toLowerCase();
  const aliases = {
    // Legacy ecommerce pipeline → retail ERP
    processing: "preparing",
    confirmed: "preparing",
    prepared: "ready",
    shipped: "ready",
    delivered: "completed",
    done: "completed",
    complete: "completed",
    canceled: "cancelled",
    refunded: "returned",
    return: "returned",
  };
  return aliases[key] ?? key;
}

function migrateOrderStatus(order) {
  return {
    ...order,
    status: normalizeStatus(order.status),
  };
}

function parseBool(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  const key = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "y"].includes(key)) return true;
  if (["0", "false", "no", "n"].includes(key)) return false;
  return fallback;
}

const uploadScreenshot = (req, res, next) => {
  const contentType = String(req.headers["content-type"] || "");
  if (!contentType.includes("multipart/form-data")) {
    return next();
  }
  upload.any()(req, res, (err) => {
    if (err) {
      console.log("Multer upload notice:", err.message);
    }
    if (Array.isArray(req.files) && req.files.length) {
      req.file = req.files.find((f) => f.fieldname === "screenshot") || req.files[0];
    }
    next();
  });
};

router.post("/", uploadScreenshot, async (req, res) => {
  try {
    const {
      customerName,
      email,
      phone,
      address,
      totalPrice,
      items,
      promoCode,
      discount,
      promoType,
      paymentMethod,
      paymentImage,
      source,
      channel,
      status: requestedStatus,
      seller_id,
      sellerId,
      seller_name,
      sellerName,
    } = req.body;

    const orderSource = String(source || channel || "website")
      .trim()
      .toLowerCase();
    const resolvedSource = ["pos", "website", "admin"].includes(orderSource)
      ? orderSource
      : "website";

    if (!customerName || !String(customerName).trim()) {
      return res.status(400).json({ message: "Customer name is required" });
    }

    if (!paymentMethod || !String(paymentMethod).trim()) {
      return res.status(400).json({ message: "Payment method is required" });
    }

    if (totalPrice === undefined || totalPrice === null || isNaN(Number(totalPrice)) || Number(totalPrice) < 0) {
      return res.status(400).json({ message: "Total price must be a valid non-negative number" });
    }

    if (discount !== undefined && discount !== null && (isNaN(Number(discount)) || Number(discount) < 0)) {
      return res.status(400).json({ message: "Discount cannot be negative" });
    }

    const rawSellerId = seller_id ?? sellerId;
    const resolvedSellerId = rawSellerId != null && rawSellerId !== "" ? Number(rawSellerId) : null;
    let resolvedSellerName = seller_name ?? sellerName ?? null;

    if (resolvedSource === "pos" && !resolvedSellerId) {
      return res.status(400).json({ message: "Salesperson is required for POS orders" });
    }

    if (resolvedSellerId) {
      const users = await readCollection("users");
      const seller = users.find((u) => u.id === resolvedSellerId);
      if (!seller) {
        return res.status(400).json({ message: "Salesperson not found" });
      }
      if (seller.status === "disabled" || seller.deleted_at) {
        return res.status(400).json({ message: `Seller ${seller.full_name || seller.username} is currently disabled` });
      }
      resolvedSellerName = seller.full_name || `${seller.firstName || ""} ${seller.lastName || ""}`.trim() || seller.username;

      const numericDiscount = Number(discount) || 0;
      const numericTotal = Number(totalPrice) || 0;
      const subtotal = numericTotal + numericDiscount;
      if (numericDiscount > 0 && subtotal > 0) {
        const discountPct = (numericDiscount / subtotal) * 100;
        const maxLimit = Number(seller.max_discount) || 0;
        if (discountPct > maxLimit + 0.01) {
          return res.status(400).json({
            message: `Discount of ${discountPct.toFixed(1)}% exceeds ${resolvedSellerName}'s maximum limit of ${maxLimit}%`,
          });
        }
      }
    }

    const itemsArray = parseJsonField(items, []);
    if (!Array.isArray(itemsArray) || itemsArray.length === 0) {
      return res.status(400).json({ message: "Order must contain at least one item" });
    }

    for (const item of itemsArray) {
      const qty = Number(item.quantity);
      const itemPrice = Number(item.price);
      if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({ message: `Item "${item.name || 'product'}" quantity must be greater than zero` });
      }
      if (isNaN(itemPrice) || itemPrice < 0) {
        return res.status(400).json({ message: `Item "${item.name || 'product'}" price cannot be negative` });
      }
    }

    let finalImage = paymentImage || null;

    if (req.file) {
      finalImage = await saveUploadedFile(
        req.file.buffer,
        "payments",
        req.file.originalname
      );
    }

    let products = await readCollection("products");
    const stockItems = itemsArray.map((item) => ({
      productId: item.productId ?? item.product_id,
      variant: item.variant ?? item.size,
      quantity: item.quantity,
    }));

    const { products: updatedProducts, errors } = decrementStock(products, stockItems);

    if (errors.length) {
      return res.status(400).json({ message: errors.join("; "), errors });
    }

    products = updatedProducts;
    await writeCollection("products", products);

    const orders = await readCollection("orders");
    const orderId = getNextId(orders);

    // POS sales are already paid and fulfilled → Completed.
    // Website / admin orders start as Pending (or an explicit allowed status).
    let initialStatus = "pending";
    if (resolvedSource === "pos") {
      initialStatus = "completed";
    } else if (requestedStatus) {
      const normalizedRequest = normalizeStatus(requestedStatus);
      if (ORDER_STATUSES.includes(normalizedRequest)) {
        initialStatus = normalizedRequest;
      }
    }

    const now = new Date().toISOString();
    const newOrder = {
      id: orderId,
      customerName,
      email,
      phone,
      address,
      totalPrice: Number(totalPrice),
      promoCode: promoCode || null,
      discount: Number(discount) || 0,
      promoType: promoType || null,
      paymentScreenshot: finalImage,
      payment_method: paymentMethod || "cash",
      source: resolvedSource,
      seller_id: resolvedSellerId,
      seller_name: resolvedSellerName,
      stockRestored: false,
      status: initialStatus,
      delivered_at: initialStatus === "completed" ? now : null,
      createdAt: now,
      items: itemsArray.map((item) => {
        const pid = item.productId ?? item.product_id ?? null;
        const matchedProduct = products.find((p) => p.id === pid);
        const bId = Number(item.brand_id ?? item.brandId ?? matchedProduct?.brandId ?? matchedProduct?.brand_id) || 1;
        const bName = item.brand_name ?? item.brandName ?? matchedProduct?.brandName ?? matchedProduct?.brand_name ?? "1990";
        const bLogo = item.brand_logo ?? item.brandLogo ?? matchedProduct?.brandLogo ?? "/uploads/brand-logo.png";
        const code = item.barcode ?? matchedProduct?.barcode ?? "";

        return {
          productId: pid,
          name: item.name,
          variant: item.variant ?? item.size ?? item.selectedSize,
          size: item.variant ?? item.size ?? item.selectedSize,
          quantity: item.quantity,
          price: item.price,
          brand_id: bId,
          brandId: bId,
          brand_name: bName,
          brandName: bName,
          brand_logo: bLogo,
          brandLogo: bLogo,
          barcode: code,
        };
      }),
    };

    orders.push(newOrder);
    await writeCollection("orders", orders);

    if (promoCode) {
      const promos = await readCollection("promos");
      const promoIndex = promos.findIndex(
        (promo) =>
          String(promo.code).trim().toLowerCase() ===
          String(promoCode).trim().toLowerCase()
      );
      if (promoIndex !== -1) {
        promos[promoIndex].used_count =
          Number(promos[promoIndex].used_count || 0) + 1;
        await writeCollection("promos", promos);
      }
    }

    // ── Respond to the client FIRST, then fire notifications in the background ──
    res.json({
      message: itemsArray.length === 0 ? "Order created (no items) ✅" : "Order created ✅",
      orderId,
      status: initialStatus,
    });

    // Fire-and-forget: notifications should never block the client response
    Promise.resolve().then(async () => {
      try {
        await notify.notifyNewOrder(newOrder);
        await checkStockAlerts(newOrder, products);
      } catch (notifyErr) {
        console.log("Notification error (new order):", notifyErr.message);
      }
    });
  } catch (err) {
    console.log("ORDER ERROR:", err);
    if (!res.headersSent) {
      res.status(500).json({ message: err.message || "Internal server error" });
    }
  }
});

router.get("/", requireAuth, async (req, res) => {
  try {
    const orders = await readCollection("orders");
    const sorted = orders.map(migrateOrderStatus).sort((a, b) => b.id - a.id);
    res.json(sorted);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/:id/stock-check", async (req, res) => {
  try {
    const { variant, quantity } = req.query;
    const productId = Number(req.params.id);
    const products = await readCollection("products");
    const product = products.find((p) => p.id === productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const v = findVariant(product, variant);
    const qty = Number(quantity) || 1;

    if (!v) {
      return res.status(404).json({ message: "Variant not found", available: false });
    }

    res.json({
      available: v.stock >= qty,
      stock: v.stock,
      requested: qty,
    });
  } catch (err) {
    res.status(500).json({ message: "Stock check failed" });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const { status } = req.body;
    const normalized = normalizeStatus(status);

    if (!ORDER_STATUSES.includes(normalized)) {
      return res.status(400).json({
        message: `Invalid status. Allowed: ${ORDER_STATUSES.join(", ")}`,
      });
    }

    const orders = await readCollection("orders");
    const index = orders.findIndex((o) => o.id === orderId);

    if (index === -1) {
      return res.status(404).json({ message: "Order not found" });
    }

    const previousStatus = normalizeStatus(orders[index].status);
    orders[index].status = normalized;

    if (normalized === "completed") {
      orders[index].delivered_at = new Date().toISOString();
    } else if (normalized !== "completed") {
      orders[index].delivered_at = orders[index].delivered_at ?? null;
    }

    // Cancel (from active pipeline) restores inventory once.
    if (
      normalized === "cancelled" &&
      previousStatus !== "cancelled" &&
      previousStatus !== "returned" &&
      !orders[index].stockRestored
    ) {
      const { restored, errors } = await restoreOrderStock(orders[index]);
      if (!restored && errors.length) {
        return res.status(400).json({
          message: `Unable to restore stock: ${errors.join("; ")}`,
          errors,
        });
      }
      orders[index].stockRestored = true;
    }

    // Restore cancelled order → Pending and re-deduct stock if it was restocked.
    if (
      normalized === "pending" &&
      previousStatus === "cancelled" &&
      orders[index].stockRestored
    ) {
      const result = await reDeductOrderStock(orders[index]);
      if (!result.ok) {
        return res.status(400).json({
          message: `Unable to restore order (stock): ${result.errors.join("; ")}`,
          errors: result.errors,
        });
      }
      orders[index].stockRestored = false;
    }

    await writeCollection("orders", orders);

    if (previousStatus !== normalized) {
      try {
        await notify.notifyStatusChange({
          order: orders[index],
          previousStatus,
          newStatus: normalized,
        });
        if (normalized === "cancelled") {
          await notify.notifyReturn(orders[index], {
            type: "cancel",
            reason: "Order cancelled — inventory restored",
          });
        }
      } catch (notifyErr) {
        console.log("Notification error (status change):", notifyErr.message);
      }
    }

    res.json({ message: "Status updated ✅", order: migrateOrderStatus(orders[index]) });
  } catch (err) {
    res.status(500).json(err);
  }
});

/** Full or partial return with inventory restock (shared by POS / Admin). */
router.post("/:id/return", requireAuth, async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const { type = "full", reason, items: returnItems } = req.body ?? {};
    const orders = await readCollection("orders");
    const index = orders.findIndex((o) => o.id === orderId);

    if (index === -1) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = migrateOrderStatus(orders[index]);
    if (order.status === "returned" && order.stockRestored) {
      return res.status(400).json({ message: "Order already returned and restocked" });
    }
    if (order.status === "cancelled" && order.stockRestored) {
      return res.status(400).json({ message: "Order already cancelled and restocked" });
    }

    const itemsToRestore =
      type === "partial" && Array.isArray(returnItems) && returnItems.length
        ? returnItems
        : order.items ?? [];

    if (!order.stockRestored) {
      const { restored, errors } = await restoreOrderStock({
        ...order,
        items: itemsToRestore,
        stockRestored: false,
      });
      if (!restored && errors.length) {
        return res.status(400).json({
          message: `Unable to restore stock: ${errors.join("; ")}`,
          errors,
        });
      }
      orders[index].stockRestored = true;
    }

    if (type !== "partial") {
      orders[index].status = "returned";
    }

    orders[index].return = {
      type,
      reason: reason || null,
      items: itemsToRestore,
      restoredAt: new Date().toISOString(),
    };

    await writeCollection("orders", orders);

    try {
      await notify.notifyReturn(orders[index], {
        type,
        reason: reason || "Return completed — inventory restored",
      });
    } catch (notifyErr) {
      console.log("Notification error (return):", notifyErr.message);
    }

    res.json({
      message: "Return processed — inventory restored ✅",
      order: migrateOrderStatus(orders[index]),
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const orders = await readCollection("orders");
    const index = orders.findIndex((o) => o.id === orderId);

    if (index === -1) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = migrateOrderStatus(orders[index]);
    const restoreRequested = parseBool(
      req.query.restoreStock ?? req.body?.restoreStock,
      false
    );

    // Completed / Cancelled / Returned: never change inventory on delete.
    // Pending / Preparing / Ready: restore only when explicitly requested.
    if (
      !NO_RESTOCK_ON_DELETE.has(order.status) &&
      ACTIVE_PIPELINE.has(order.status) &&
      restoreRequested &&
      !order.stockRestored
    ) {
      const { restored, errors } = await restoreOrderStock(order);
      if (!restored && errors.length) {
        return res.status(400).json({
          message: `Unable to restore stock before delete: ${errors.join("; ")}`,
          errors,
        });
      }
    }

    const filtered = orders.filter((o) => o.id !== orderId);
    await writeCollection("orders", filtered);
    res.json({
      message: "Order deleted 🗑️",
      restoredStock:
        ACTIVE_PIPELINE.has(order.status) && restoreRequested && !order.stockRestored,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;
