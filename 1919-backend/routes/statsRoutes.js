import express from "express";
import { readCollection } from "../lib/jsonStore.js";
import { getStockStatus } from "../lib/inventory.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

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

function isSameMonth(iso, now = new Date()) {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

async function computeSellerPerformance() {
  const [users, orders, products] = await Promise.all([
    readCollection("users"),
    readCollection("orders"),
    readCollection("products"),
  ]);

  const productMap = new Map(products.map((p) => [p.id, p]));
  const sellers = users.filter(
    (u) => u.role === "seller" && !u.deleted_at && u.status !== "disabled"
  );
  const completedOrders = orders.filter(
    (o) => normalizeStatus(o.status) === "completed"
  );
  const now = new Date();

  const performance = sellers.map((seller) => {
    const sellerOrders = completedOrders.filter(
      (o) => Number(o.seller_id) === Number(seller.id)
    );
    const todayOrders = sellerOrders.filter((o) => isSameDay(o.createdAt, now));
    const monthOrders = sellerOrders.filter((o) => isSameMonth(o.createdAt, now));

    const invoiceCount = sellerOrders.length;
    const totalSales = sellerOrders.reduce(
      (sum, o) => sum + (Number(o.totalPrice) || 0),
      0
    );
    const averageInvoice = invoiceCount > 0 ? totalSales / invoiceCount : 0;
    const totalDiscount = sellerOrders.reduce(
      (sum, o) => sum + (Number(o.discount) || 0),
      0
    );
    const todaySales = todayOrders.reduce(
      (sum, o) => sum + (Number(o.totalPrice) || 0),
      0
    );
    const monthlySales = monthOrders.reduce(
      (sum, o) => sum + (Number(o.totalPrice) || 0),
      0
    );
    const monthlyTarget = Number(seller.monthly_target) || 0;
    const targetProgress =
      monthlyTarget > 0 ? Math.min(999, (monthlySales / monthlyTarget) * 100) : 0;

    // Group seller sales by Brand
    const brandMap = new Map();
    for (const o of sellerOrders) {
      for (const item of o.items || []) {
        const pid = item.productId ?? item.product_id;
        const matchedP = productMap.get(pid);
        const bId = Number(item.brand_id ?? item.brandId ?? matchedP?.brandId ?? matchedP?.brand_id) || 1;
        const bName = item.brand_name ?? item.brandName ?? matchedP?.brandName ?? matchedP?.brand_name ?? "1990";
        const bLogo = item.brand_logo ?? item.brandLogo ?? matchedP?.brandLogo ?? "/uploads/brand-logo.png";
        const itemTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);
        const itemQty = Number(item.quantity) || 1;

        if (!brandMap.has(bId)) {
          brandMap.set(bId, {
            brand_id: bId,
            brand_name: bName,
            brand_logo: bLogo,
            sales_count: 0,
            items_count: 0,
            revenue: 0,
          });
        }
        const bEntry = brandMap.get(bId);
        bEntry.sales_count += 1;
        bEntry.items_count += itemQty;
        bEntry.revenue += itemTotal;
      }
    }

    const brandBreakdown = Array.from(brandMap.values()).sort((a, b) => b.revenue - a.revenue);

    return {
      seller_id: seller.id,
      seller_name:
        seller.full_name ||
        `${seller.firstName || ""} ${seller.lastName || ""}`.trim() ||
        seller.username,
      username: seller.username || "",
      status: seller.status || "active",
      max_discount: Number(seller.max_discount) || 0,
      invoice_count: invoiceCount,
      total_sales: Math.round(totalSales * 100) / 100,
      average_invoice: Math.round(averageInvoice * 100) / 100,
      total_discount: Math.round(totalDiscount * 100) / 100,
      today_sales: Math.round(todaySales * 100) / 100,
      monthly_sales: Math.round(monthlySales * 100) / 100,
      monthly_target: monthlyTarget,
      target_progress: Math.round(targetProgress * 10) / 10,
      brand_breakdown: brandBreakdown,
    };
  });

  performance.sort((a, b) => b.total_sales - a.total_sales);
  performance.forEach((s, idx) => {
    s.rank = idx + 1;
  });

  return performance;
}

router.get("/seller-performance", requireAuth, requireRole("admin"), async (_req, res) => {
  try {
    const sellers = await computeSellerPerformance();
    res.json(sellers);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch seller performance" });
  }
});

router.get("/brand-analytics", requireAuth, requireRole("admin"), async (_req, res) => {
  try {
    const [brands, products, orders] = await Promise.all([
      readCollection("brands"),
      readCollection("products"),
      readCollection("orders"),
    ]);

    const productMap = new Map(products.map((p) => [p.id, p]));
    const completedOrders = orders.filter((o) => normalizeStatus(o.status) === "completed");

    const brandStats = new Map();
    for (const b of brands) {
      brandStats.set(b.id, {
        brand_id: b.id,
        brand_name: b.name,
        slug: b.slug,
        logo: b.logo || "/uploads/brand-logo.png",
        barcodePrefix: b.barcodePrefix || "1990",
        commissionPercentage: Number(b.commissionPercentage) || 0,
        status: b.status || "active",
        product_count: 0,
        order_count: 0,
        items_sold: 0,
        total_revenue: 0,
        commission_amount: 0,
      });
    }

    for (const p of products) {
      const bId = Number(p.brandId ?? p.brand_id) || 1;
      if (brandStats.has(bId)) {
        brandStats.get(bId).product_count += 1;
      }
    }

    const orderBrandSet = new Map(); // orderId -> set of brandIds

    for (const o of completedOrders) {
      for (const item of o.items || []) {
        const pid = item.productId ?? item.product_id;
        const matchedP = productMap.get(pid);
        const bId = Number(item.brand_id ?? item.brandId ?? matchedP?.brandId ?? matchedP?.brand_id) || 1;
        const qty = Number(item.quantity) || 1;
        const price = Number(item.price) || 0;
        const lineTotal = price * qty;

        if (brandStats.has(bId)) {
          const bs = brandStats.get(bId);
          bs.items_sold += qty;
          bs.total_revenue += lineTotal;
          bs.commission_amount += lineTotal * (bs.commissionPercentage / 100);

          if (!orderBrandSet.has(o.id)) orderBrandSet.set(o.id, new Set());
          orderBrandSet.get(o.id).add(bId);
        }
      }
    }

    for (const [orderId, brandIds] of orderBrandSet.entries()) {
      for (const bId of brandIds) {
        if (brandStats.has(bId)) {
          brandStats.get(bId).order_count += 1;
        }
      }
    }

    const brandList = Array.from(brandStats.values()).map((b) => ({
      ...b,
      total_revenue: Math.round(b.total_revenue * 100) / 100,
      commission_amount: Math.round(b.commission_amount * 100) / 100,
      average_order_value:
        b.order_count > 0 ? Math.round((b.total_revenue / b.order_count) * 100) / 100 : 0,
    }));

    const topSelling = [...brandList].sort((a, b) => b.total_revenue - a.total_revenue).slice(0, 5);
    const lowestSelling = [...brandList]
      .filter((b) => b.status === "active")
      .sort((a, b) => a.total_revenue - b.total_revenue)
      .slice(0, 5);

    const totalRevenue = brandList.reduce((sum, b) => sum + b.total_revenue, 0);
    const totalCommission = brandList.reduce((sum, b) => sum + b.commission_amount, 0);

    res.json({
      summary: {
        total_brands: brandList.length,
        active_brands: brandList.filter((b) => b.status === "active").length,
        total_revenue: Math.round(totalRevenue * 100) / 100,
        total_commission: Math.round(totalCommission * 100) / 100,
      },
      top_selling_brands: topSelling,
      lowest_selling_brands: lowestSelling,
      brands: brandList,
    });
  } catch (err) {
    console.error("BRAND ANALYTICS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch brand analytics" });
  }
});

router.get("/brand-reports", requireAuth, requireRole("admin"), async (_req, res) => {
  try {
    const [brands, products, orders] = await Promise.all([
      readCollection("brands"),
      readCollection("products"),
      readCollection("orders"),
    ]);

    const productMap = new Map(products.map((p) => [p.id, p]));
    const completedOrders = orders.filter((o) => normalizeStatus(o.status) === "completed");

    const reports = brands.map((b) => {
      const brandProducts = products.filter((p) => Number(p.brandId ?? p.brand_id) === b.id);
      let totalRevenue = 0;
      let totalItems = 0;
      const orderSet = new Set();
      const productSales = new Map();

      for (const o of completedOrders) {
        for (const item of o.items || []) {
          const pid = item.productId ?? item.product_id;
          const matchedP = productMap.get(pid);
          const bId = Number(item.brand_id ?? item.brandId ?? matchedP?.brandId ?? matchedP?.brand_id) || 1;

          if (bId === b.id) {
            orderSet.add(o.id);
            const qty = Number(item.quantity) || 1;
            const price = Number(item.price) || 0;
            const lineTotal = price * qty;

            totalRevenue += lineTotal;
            totalItems += qty;

            if (!productSales.has(pid)) {
              productSales.set(pid, {
                product_id: pid,
                name: item.name || matchedP?.name || "Product",
                units_sold: 0,
                revenue: 0,
              });
            }
            const ps = productSales.get(pid);
            ps.units_sold += qty;
            ps.revenue += lineTotal;
          }
        }
      }

      const bestSelling = Array.from(productSales.values())
        .sort((a, b) => b.units_sold - a.units_sold)
        .slice(0, 5);

      const commPct = Number(b.commissionPercentage) || 0;
      const commAmount = totalRevenue * (commPct / 100);

      return {
        brand_id: b.id,
        brand_name: b.name,
        slug: b.slug,
        logo: b.logo || "/uploads/brand-logo.png",
        barcode_prefix: b.barcodePrefix || "1990",
        status: b.status || "active",
        products_count: brandProducts.length,
        total_orders: orderSet.size,
        units_sold: totalItems,
        total_revenue: Math.round(totalRevenue * 100) / 100,
        average_order_value: orderSet.size > 0 ? Math.round((totalRevenue / orderSet.size) * 100) / 100 : 0,
        commission_percentage: commPct,
        commission_amount: Math.round(commAmount * 100) / 100,
        best_selling_products: bestSelling,
      };
    });

    res.json(reports);
  } catch (err) {
    console.error("BRAND REPORTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch brand reports" });
  }
});

router.get("/", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const [products, orders, reviews, users, brands, sellerPerf] = await Promise.all([
      readCollection("products"),
      readCollection("orders"),
      readCollection("reviews"),
      readCollection("users"),
      readCollection("brands"),
      computeSellerPerformance(),
    ]);

    const now = new Date();
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
    const completedOrders = migrated.filter((o) => completedStatuses.has(o.status));

    const todayCompleted = completedOrders.filter((o) => isSameDay(o.createdAt, now));
    const monthCompleted = completedOrders.filter((o) => isSameMonth(o.createdAt, now));

    const todaySales = todayCompleted.length;
    const todayRevenue = todayCompleted.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
    const monthlySales = monthCompleted.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);

    const totalRevenue = completedOrders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
    const totalDiscounts = completedOrders.reduce((sum, o) => sum + (Number(o.discount) || 0), 0);

    const activeUsers = users.filter((u) => !u.deleted_at && u.status !== "disabled");
    const totalCustomers = activeUsers.filter((u) => u.role === "customer").length;
    const totalSellers = activeUsers.filter((u) => u.role === "seller").length;

    const lowStockProductsList = products
      .filter((p) => ["low_stock", "sold_out"].includes(getStockStatus(p)))
      .map((p) => {
        const bId = Number(p.brandId ?? p.brand_id) || 1;
        const b = brands.find((brand) => brand.id === bId);
        return {
          id: p.id,
          name: p.name,
          brandName: p.brandName || p.brand_name || b?.name || "1990",
          stockStatus: getStockStatus(p),
          totalStock: Number(p.totalStock) || 0,
        };
      });

    const lowStockProducts = lowStockProductsList.filter((p) => p.stockStatus === "low_stock").length;
    const soldOutProducts = lowStockProductsList.filter((p) => p.stockStatus === "sold_out").length;

    // Brand revenue breakdown
    const brandMap = new Map();
    for (const b of brands) {
      brandMap.set(b.id, { id: b.id, name: b.name, revenue: 0, orders: 0 });
    }
    for (const o of completedOrders) {
      for (const item of o.items || []) {
        const bId = Number(item.brand_id ?? item.brandId) || 1;
        const lineTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);
        if (!brandMap.has(bId)) {
          brandMap.set(bId, { id: bId, name: item.brand_name || item.brandName || "1990", revenue: 0, orders: 0 });
        }
        const bEntry = brandMap.get(bId);
        bEntry.revenue += lineTotal;
        bEntry.orders += 1;
      }
    }
    const salesByBrand = Array.from(brandMap.values())
      .map((b) => ({ ...b, revenue: Math.round(b.revenue * 100) / 100 }))
      .sort((a, b) => b.revenue - a.revenue);

    const topBrand = salesByBrand.length ? salesByBrand[0] : null;

    // Last 30 Days time-series data for Charts
    const daysMap = new Map();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      daysMap.set(dateStr, { date: dateStr, sales: 0, revenue: 0, orders: 0 });
    }

    for (const o of migrated) {
      if (!o.createdAt) continue;
      const dateStr = String(o.createdAt).slice(0, 10);
      if (daysMap.has(dateStr)) {
        const dayObj = daysMap.get(dateStr);
        dayObj.orders += 1;
        if (completedStatuses.has(o.status)) {
          dayObj.revenue += Number(o.totalPrice) || 0;
          dayObj.sales += 1;
        }
      }
    }

    const salesOverTime = Array.from(daysMap.values()).map((d) => ({
      ...d,
      revenue: Math.round(d.revenue * 100) / 100,
    }));

    const recentOrders = migrated
      .sort((a, b) => b.id - a.id)
      .slice(0, 10)
      .map((o) => ({
        id: o.id,
        customerName: o.customerName || "Customer",
        email: o.email || "",
        totalPrice: Number(o.totalPrice) || 0,
        status: o.status,
        source: o.source || "website",
        payment_method: o.payment_method || "cash",
        createdAt: o.createdAt,
        itemCount: (o.items || []).length,
      }));

    const topSeller = sellerPerf.length ? sellerPerf[0] : null;
    const lowestSeller = sellerPerf.length ? sellerPerf[sellerPerf.length - 1] : null;

    res.json({
      totalOrders: orders.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      monthlySales: Math.round(monthlySales * 100) / 100,
      todaySales,
      todayRevenue: Math.round(todayRevenue * 100) / 100,
      totalDiscounts: Math.round(totalDiscounts * 100) / 100,
      totalProducts: products.length,
      totalCustomers,
      totalSellers,
      totalReviews: reviews.length,
      pendingOrders: statusBreakdown.pending ?? 0,
      preparingOrders: statusBreakdown.preparing ?? 0,
      readyOrders: statusBreakdown.ready ?? 0,
      completedOrders: statusBreakdown.completed ?? 0,
      cancelledOrders: statusBreakdown.cancelled ?? 0,
      returnedOrders: statusBreakdown.returned ?? 0,
      lowStockProducts,
      soldOutProducts,
      lowStockProductsList,
      statusBreakdown,
      topBrand,
      salesByBrand,
      salesOverTime,
      recentOrders,
      topSellers: {
        topSeller,
        lowestSeller,
        rankings: sellerPerf,
      },
    });
  } catch (err) {
    console.error("GET STATS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch statistics" });
  }
});

export default router;
