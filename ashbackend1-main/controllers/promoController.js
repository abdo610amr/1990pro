import {
  readCollection,
  writeCollection,
  getNextId,
} from "../lib/jsonStore.js";

// ➕ CREATE
export const createPromo = async (req, res) => {
  try {
    const { code } = req.body;

    const cleanCode = code.trim().toLowerCase();
    const promos = await readCollection("promos");

    const exists = promos.some(
      (p) => p.code.trim().toLowerCase() === cleanCode
    );

    if (exists) {
      return res.status(400).json({
        message: "Promo code already exists",
      });
    }

    const newPromo = {
      id: getNextId(promos),
      ...req.body,
      code: cleanCode,
      used_count: 0,
    };

    promos.push(newPromo);
    await writeCollection("promos", promos);

    res.json({ message: "Promo created successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

// 📥 GET ALL
export const getAllPromos = async (req, res) => {
  try {
    const promos = await readCollection("promos");
    const sorted = [...promos].sort((a, b) => b.id - a.id);

    res.json(sorted);
  } catch (err) {
    res.status(500).json(err);
  }
};

// ❌ DELETE
export const deletePromo = async (req, res) => {
  try {
    const promoId = Number(req.params.id);
    const promos = await readCollection("promos");
    const filtered = promos.filter((p) => p.id !== promoId);

    if (filtered.length === promos.length) {
      return res.status(404).json({ message: "Promo not found" });
    }

    await writeCollection("promos", filtered);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
};

// 🔥 APPLY PROMO
export const applyPromo = async (req, res) => {
  const { code, totalAmount, email, cartItems } = req.body;

  try {
    if (!code) {
      return res.status(400).json({
        message: "Promo code required",
      });
    }

    const cleanCode = code.trim().toLowerCase();
    const promos = await readCollection("promos");
    const p = promos.find(
      (promo) => promo.code.trim().toLowerCase() === cleanCode
    );

    if (!p) {
      return res.status(404).json({
        message: "Invalid promo code",
      });
    }

    if (!p.active) {
      return res.status(400).json({
        message: "Promo not active",
      });
    }

    const now = new Date();

    if (
      (p.start_date && now < new Date(p.start_date)) ||
      (p.end_date && now > new Date(p.end_date))
    ) {
      return res.status(400).json({
        message: "Promo expired",
      });
    }

    if (p.usage_limit && p.used_count >= p.usage_limit) {
      return res.status(400).json({
        message: "Promo limit reached",
      });
    }

    if (email) {
      const orders = await readCollection("orders");
      const usedBefore = orders.some(
        (order) => order.email === email && order.promoCode === cleanCode
      );

      if (usedBefore) {
        return res.status(400).json({
          message: "You already used this promo code",
        });
      }
    }

    if (totalAmount < p.min_order) {
      return res.status(400).json({
        message: "Minimum order not reached",
      });
    }

    let discount = 0;

    switch (p.type) {
      case "percentage":
        discount = (totalAmount * p.discount_value) / 100;
        break;

      case "fixed":
        discount = p.discount_value;
        break;

      case "bogo":
        if (!cartItems || !Array.isArray(cartItems)) {
          return res.status(400).json({
            message: "Cart items required",
          });
        }

        const normalize = (s) =>
          String(s).replace("ml", "").trim().toLowerCase();

        const buyItems = cartItems.filter(
          (item) => normalize(item.size) === normalize(p.bundle_buy)
        );

        if (buyItems.length === 0) {
          return res.status(400).json({
            message: `Add ${p.bundle_buy}ml items to activate promo`,
          });
        }

        const totalBuyQuantity = buyItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );

        const getItems = cartItems.filter(
          (item) => normalize(item.size) === normalize(p.bundle_get)
        );

        if (getItems.length === 0) {
          return res.status(400).json({
            message: `Add ${p.bundle_get}ml free item to cart`,
          });
        }

        const buyQty = p.buy_qty || 1;
        const getQty = p.get_qty || 1;

        const eligibleGroups = Math.floor(totalBuyQuantity / buyQty);

        if (eligibleGroups <= 0) {
          return res.status(400).json({
            message: `Buy ${buyQty} Get ${getQty} offer not completed`,
          });
        }

        const freeItems = eligibleGroups * getQty;

        const sortedGetItems = [...getItems].sort(
          (a, b) => a.price - b.price
        );

        let remainingFreeItems = freeItems;

        discount = 0;

        for (const item of sortedGetItems) {
          if (remainingFreeItems <= 0) break;

          const freeQty = Math.min(item.quantity, remainingFreeItems);

          discount += freeQty * item.price;
          remainingFreeItems -= freeQty;
        }

        break;

      case "bundle":
        return res.json({
          type: "bundle",
          buy: p.bundle_buy,
          get: p.bundle_get,
          message: "Bundle offer applied 🎁",
        });

      default:
        break;
    }

    if (discount > totalAmount) {
      discount = totalAmount;
    }

    const finalPrice = totalAmount - discount;

    res.json({
      type: p.type,
      discount,
      finalPrice,
      promo: p.code,
      message: "Promo applied successfully ✅",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: err.message,
    });
  }
};
