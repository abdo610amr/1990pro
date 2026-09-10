import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { rateLimit } from "express-rate-limit";
import {
  getNextId,
  readCollection,
  writeCollection,
} from "../lib/jsonStore.js";
import { requireAuth, signAuthToken } from "../middlewares/auth.js";
import { sendCustomerEmail } from "../services/notificationService.js";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 30, // Limit each IP to 30 requests per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many authentication attempts. Please try again later." },
});

router.use("/login", authLimiter);
router.use("/register", authLimiter);
router.use("/forgot-password", authLimiter);

function normalizeEmail(value) {
  return String(value ?? "").trim().toLowerCase();
}

function publicUser(user) {
  const {
    passwordHash,
    resetTokenHash,
    resetTokenExpiresAt,
    failed_attempts,
    locked_until,
    ...safeUser
  } = user;
  return {
    ...safeUser,
    full_name: safeUser.full_name || `${safeUser.firstName || ""} ${safeUser.lastName || ""}`.trim(),
    username: safeUser.username || "",
    role: safeUser.role || "seller",
    status: safeUser.status || "active",
    max_discount: safeUser.max_discount ?? (safeUser.role === "admin" ? 100 : 0),
    monthly_target: safeUser.monthly_target ?? 0,
  };
}

async function getUser(userId) {
  const users = await readCollection("users");
  return {
    users,
    user: users.find((item) => item.id === Number(userId)),
  };
}

router.post("/register", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password ?? "");
    const firstName = String(req.body.firstName ?? "").trim();
    const lastName = String(req.body.lastName ?? "").trim();

    if (!email || !firstName || !lastName || password.length < 8) {
      return res.status(400).json({
        message:
          "Email, first name, last name, and a password of at least 8 characters are required",
      });
    }

    const users = await readCollection("users");
    if (users.some((user) => user.email === email)) {
      return res.status(409).json({ message: "An account already exists" });
    }

    const user = {
      id: getNextId(users),
      email,
      passwordHash: await bcrypt.hash(password, 12),
      firstName,
      lastName,
      role: "customer",
      status: "active",
      max_discount: 0,
      monthly_target: 0,
      phone: String(req.body.phone ?? "").trim(),
      avatar: null,
      addresses: [],
      wishlist: [],
      failed_attempts: 0,
      locked_until: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(user);
    await writeCollection("users", users);
    res.status(201).json({
      token: signAuthToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const identifier = String(req.body.identifier ?? req.body.email ?? req.body.username ?? "").trim().toLowerCase();
    const password = String(req.body.password ?? "");
    const users = await readCollection("users");
    const userIndex = users.findIndex(
      (item) =>
        (item.email && item.email.toLowerCase() === identifier) ||
        (item.username && item.username.toLowerCase() === identifier)
    );

    if (userIndex === -1) {
      return res.status(401).json({ message: "Invalid username, email, or password" });
    }

    const user = users[userIndex];

    // Check account lockout
    if (user.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
      const remainingMins = Math.ceil((new Date(user.locked_until).getTime() - Date.now()) / 60000);
      return res.status(429).json({
        message: `Account is temporarily locked due to multiple failed login attempts. Try again in ${remainingMins} minute(s).`,
      });
    }

    if (user.status === "disabled" || user.deleted_at) {
      return res.status(403).json({ message: "Account is disabled. Please contact an administrator." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash || "");

    if (!isMatch) {
      const failedAttempts = (user.failed_attempts || 0) + 1;
      users[userIndex].failed_attempts = failedAttempts;

      if (failedAttempts >= 5) {
        users[userIndex].locked_until = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        await writeCollection("users", users);
        return res.status(429).json({
          message: "Too many failed login attempts. Account locked for 15 minutes.",
        });
      }

      await writeCollection("users", users);
      return res.status(401).json({
        message: `Invalid username, email, or password. (${5 - failedAttempts} attempt(s) remaining)`,
      });
    }

    // Reset failed attempts on successful login
    if (user.failed_attempts > 0 || user.locked_until) {
      users[userIndex].failed_attempts = 0;
      users[userIndex].locked_until = null;
      await writeCollection("users", users);
    }

    res.json({ token: signAuthToken(user), user: publicUser(user) });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const users = await readCollection("users");
    const index = users.findIndex((item) => item.email === email);
    let resetToken;

    if (index !== -1) {
      resetToken = crypto.randomBytes(32).toString("hex");
      users[index] = {
        ...users[index],
        resetTokenHash: crypto
          .createHash("sha256")
          .update(resetToken)
          .digest("hex"),
        resetTokenExpiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await writeCollection("users", users);
      const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";
      const resetUrl = `${frontendUrl}/auth/reset-password?token=${resetToken}`;
      try {
        await sendCustomerEmail({
          to: email,
          subject: "Reset your 1990 password",
          text: `Reset your password: ${resetUrl}`,
          html: `<p>Use the link below to reset your 1990 password. It expires in 30 minutes.</p><p><a href="${resetUrl}">Reset password</a></p>`,
        });
      } catch (emailError) {
        console.error("PASSWORD RESET EMAIL ERROR:", emailError.message);
      }
    }

    res.json({
      message:
        "If that email exists, password reset instructions have been prepared",
      ...(process.env.NODE_ENV !== "production" && resetToken
        ? { resetToken }
        : {}),
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    res.status(500).json({ message: "Unable to process password reset" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const password = String(req.body.password ?? "");
    const tokenHash = crypto
      .createHash("sha256")
      .update(String(req.body.token ?? ""))
      .digest("hex");
    const users = await readCollection("users");
    const index = users.findIndex(
      (item) =>
        item.resetTokenHash === tokenHash &&
        new Date(item.resetTokenExpiresAt).getTime() > Date.now()
    );

    if (index === -1 || password.length < 8) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    users[index] = {
      ...users[index],
      passwordHash: await bcrypt.hash(password, 12),
      resetTokenHash: null,
      resetTokenExpiresAt: null,
      updatedAt: new Date().toISOString(),
    };
    await writeCollection("users", users);
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    res.status(500).json({ message: "Unable to reset password" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  const { user } = await getUser(req.auth.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(publicUser(user));
});

router.put("/profile", requireAuth, async (req, res) => {
  try {
    const { users, user } = await getUser(req.auth.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const email = normalizeEmail(req.body.email ?? user.email);
    if (users.some((item) => item.email === email && item.id !== user.id)) {
      return res.status(409).json({ message: "Email is already in use" });
    }

    const index = users.findIndex((item) => item.id === user.id);
    users[index] = {
      ...user,
      email,
      firstName: String(req.body.firstName ?? user.firstName).trim(),
      lastName: String(req.body.lastName ?? user.lastName).trim(),
      phone: String(req.body.phone ?? user.phone ?? "").trim(),
      updatedAt: new Date().toISOString(),
    };
    await writeCollection("users", users);
    res.json(publicUser(users[index]));
  } catch (error) {
    console.error("PROFILE ERROR:", error);
    res.status(500).json({ message: "Unable to update profile" });
  }
});

router.get("/addresses", requireAuth, async (req, res) => {
  const { user } = await getUser(req.auth.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user.addresses ?? []);
});

router.post("/addresses", requireAuth, async (req, res) => {
  const { users, user } = await getUser(req.auth.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  const addresses = user.addresses ?? [];
  const address = {
    ...req.body,
    id: getNextId(addresses),
    isDefault: req.body.isDefault === true || addresses.length === 0,
  };
  if (address.isDefault) {
    addresses.forEach((item) => {
      item.isDefault = false;
    });
  }
  user.addresses = [...addresses, address];
  user.updatedAt = new Date().toISOString();
  await writeCollection("users", users);
  res.status(201).json(address);
});

router.put("/addresses/:id", requireAuth, async (req, res) => {
  const { users, user } = await getUser(req.auth.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  const id = Number(req.params.id);
  const addresses = user.addresses ?? [];
  const index = addresses.findIndex((item) => item.id === id);
  if (index === -1) return res.status(404).json({ message: "Address not found" });
  if (req.body.isDefault === true) {
    addresses.forEach((item) => {
      item.isDefault = false;
    });
  }
  addresses[index] = { ...addresses[index], ...req.body, id };
  user.addresses = addresses;
  user.updatedAt = new Date().toISOString();
  await writeCollection("users", users);
  res.json(addresses[index]);
});

router.delete("/addresses/:id", requireAuth, async (req, res) => {
  const { users, user } = await getUser(req.auth.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  const id = Number(req.params.id);
  const previous = user.addresses ?? [];
  user.addresses = previous.filter((item) => item.id !== id);
  if (user.addresses.length && !user.addresses.some((item) => item.isDefault)) {
    user.addresses[0].isDefault = true;
  }
  user.updatedAt = new Date().toISOString();
  await writeCollection("users", users);
  res.json({ message: "Address deleted" });
});

router.get("/wishlist", requireAuth, async (req, res) => {
  const { user } = await getUser(req.auth.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user.wishlist ?? []);
});

router.post("/wishlist/:productId", requireAuth, async (req, res) => {
  const { users, user } = await getUser(req.auth.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  const productId = Number(req.params.productId);
  user.wishlist = [...new Set([...(user.wishlist ?? []), productId])];
  user.updatedAt = new Date().toISOString();
  await writeCollection("users", users);
  res.json(user.wishlist);
});

router.delete("/wishlist/:productId", requireAuth, async (req, res) => {
  const { users, user } = await getUser(req.auth.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  const productId = Number(req.params.productId);
  user.wishlist = (user.wishlist ?? []).filter((id) => id !== productId);
  user.updatedAt = new Date().toISOString();
  await writeCollection("users", users);
  res.json(user.wishlist);
});

router.get("/orders", requireAuth, async (req, res) => {
  const orders = await readCollection("orders");
  res.json(
    orders
      .filter((order) => normalizeEmail(order.email) === req.auth.email)
      .sort((a, b) => b.id - a.id)
  );
});

/** Registered website customers for POS / CRM (no password hashes). */
router.get("/customers", requireAuth, async (_req, res) => {
  try {
    const [users, orders] = await Promise.all([
      readCollection("users"),
      readCollection("orders"),
    ]);

    const spendByEmail = new Map();
    for (const order of orders) {
      const email = normalizeEmail(order.email);
      if (!email) continue;
      const current = spendByEmail.get(email) ?? { orders: 0, spend: 0, lastOrder: null };
      current.orders += 1;
      current.spend += Number(order.totalPrice) || 0;
      if (
        !current.lastOrder ||
        String(order.createdAt || "") > String(current.lastOrder)
      ) {
        current.lastOrder = order.createdAt ?? null;
      }
      spendByEmail.set(email, current);
    }

    const customers = users
      .map((user) => {
        const email = normalizeEmail(user.email);
        const stats = spendByEmail.get(email) ?? {
          orders: 0,
          spend: 0,
          lastOrder: null,
        };
        return {
          ...publicUser(user),
          orderCount: stats.orders,
          totalSpend: stats.spend,
          lastOrderAt: stats.lastOrder,
        };
      })
      .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));

    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: "Unable to load customers" });
  }
});

export default router;
