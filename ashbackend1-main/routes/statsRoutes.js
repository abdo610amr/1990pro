import express from "express";
import { readCollection } from "../lib/jsonStore.js";
import { getStockStatus } from "../lib/inventory.js";

const router = express.Router();

function normalizeStatus(status) {
  const key = String(status ?? "")
    .trim()
    .toLowerCase();
  const aliases = {
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

function isSameDay(iso, now = new Date()) {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

router.get("/", async (req, res) => {
  try {
    const [products, orders, reviews] = await Promise.all([
      readCollection("products"),
      readCollection("orders"),
      readCollection("reviews"),
    ]);

    const migrated = orders.map((o) => ({
      ...o,
      status: normalizeStatus(o.status),
    }));

    const statusBreakdown = migrated.reduce((acc, o) => {
      const key = o.status;
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    const completedStatuses = new Set(["completed"]);
    const todayCompleted = migrated.filter(
      (o) => completedStatuses.has(o.status) && isSameDay(o.createdAt)
    );
    const todaySales = todayCompleted.length;
    const todayRevenue = todayCompleted.reduce(
      (sum, o) => sum + (Number(o.totalPrice) || 0),
      0
    );

    // Lifetime revenue from completed sales only (not cancelled/returned/pending).
    const totalRevenue = migrated
      .filter((o) => completedStatuses.has(o.status))
      .reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);

    const lowStockProducts = products.filter(
      (p) => getStockStatus(p) === "low_stock"
    ).length;

    const soldOutProducts = products.filter(
      (p) => getStockStatus(p) === "sold_out"
    ).length;

    res.json({
      totalOrders: orders.length,
      totalRevenue,
      totalProducts: products.length,
      totalReviews: reviews.length,
      pendingOrders: statusBreakdown.pending ?? 0,
      preparingOrders: statusBreakdown.preparing ?? 0,
      readyOrders: statusBreakdown.ready ?? 0,
      completedOrders: statusBreakdown.completed ?? 0,
      cancelledOrders: statusBreakdown.cancelled ?? 0,
      returnedOrders: statusBreakdown.returned ?? 0,
      todaySales,
      todayRevenue,
      lowStockProducts,
      soldOutProducts,
      statusBreakdown,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch statistics" });
  }
});

export default router;
