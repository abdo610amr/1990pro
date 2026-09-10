import express from "express";
import bcrypt from "bcryptjs";
import { readCollection, writeCollection, getNextId } from "../lib/jsonStore.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = express.Router();

function safeUser(user) {
  const { passwordHash, resetTokenHash, resetTokenExpiresAt, ...safe } = user;
  return {
    ...safe,
    full_name: safe.full_name || `${safe.firstName || ""} ${safe.lastName || ""}`.trim(),
    username: safe.username || "",
    role: safe.role || "seller",
    status: safe.status || "active",
    max_discount: safe.max_discount ?? (safe.role === "admin" ? 100 : 0),
    monthly_target: safe.monthly_target ?? 0,
  };
}

/** Public / authenticated helper to fetch active sellers for the Salesperson dropdown */
router.get("/sellers", async (_req, res) => {
  try {
    const users = await readCollection("users");
    const sellers = users
      .filter((u) => u.role === "seller" && u.status === "active" && !u.deleted_at)
      .map(safeUser);
    res.json(sellers);
  } catch (err) {
    res.status(500).json({ message: "Failed to load sellers" });
  }
});

/** List all staff users (Admin only) */
router.get("/", requireAuth, requireRole("admin"), async (_req, res) => {
  try {
    const users = await readCollection("users");
    const staff = users
      .filter((u) => u.role !== "customer" && !u.deleted_at)
      .map(safeUser);
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: "Failed to load users" });
  }
});

/** Create a new seller / staff user (Admin only) */
router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const {
      full_name,
      username,
      email,
      password,
      role = "seller",
      max_discount = 0,
      monthly_target = 0,
      status = "active",
    } = req.body;

    if (!full_name || !username || !password) {
      return res.status(400).json({ message: "Full Name, Username, and Password are required" });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const cleanEmail = String(email || "").trim().toLowerCase();

    const users = await readCollection("users");

    if (users.some((u) => !u.deleted_at && u.username && u.username.toLowerCase() === cleanUsername)) {
      return res.status(409).json({ message: `Username "${cleanUsername}" is already taken` });
    }

    if (cleanEmail && users.some((u) => !u.deleted_at && u.email && u.email.toLowerCase() === cleanEmail)) {
      return res.status(409).json({ message: `Email "${cleanEmail}" is already registered` });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    const now = new Date().toISOString();
    const [firstName, ...rest] = String(full_name).trim().split(" ");

    const newUser = {
      id: getNextId(users),
      full_name: String(full_name).trim(),
      username: cleanUsername,
      email: cleanEmail || `${cleanUsername}@1990.store`,
      passwordHash,
      role: role === "admin" ? "admin" : "seller",
      status: status === "disabled" ? "disabled" : "active",
      max_discount: Math.min(100, Math.max(0, Number(max_discount) || 0)),
      monthly_target: Math.max(0, Number(monthly_target) || 0),
      firstName: firstName || cleanUsername,
      lastName: rest.join(" ") || "",
      phone: "",
      avatar: null,
      addresses: [],
      wishlist: [],
      createdAt: now,
      updatedAt: now,
      deleted_at: null,
    };

    users.push(newUser);
    await writeCollection("users", users);

    res.status(201).json({ message: "User created successfully", user: safeUser(newUser) });
  } catch (err) {
    console.error("CREATE USER ERROR:", err);
    res.status(500).json({ message: "Failed to create user" });
  }
});

/** Edit seller / staff user (Admin only) */
router.put("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const users = await readCollection("users");
    const index = users.findIndex((u) => u.id === userId && !u.deleted_at);

    if (index === -1) {
      return res.status(404).json({ message: "User not found" });
    }

    const { full_name, username, email, role, max_discount, monthly_target, status } = req.body;

    if (username) {
      const cleanUsername = String(username).trim().toLowerCase();
      if (users.some((u) => u.id !== userId && !u.deleted_at && u.username && u.username.toLowerCase() === cleanUsername)) {
        return res.status(409).json({ message: `Username "${cleanUsername}" is already taken` });
      }
      users[index].username = cleanUsername;
    }

    if (email) {
      const cleanEmail = String(email).trim().toLowerCase();
      if (users.some((u) => u.id !== userId && !u.deleted_at && u.email && u.email.toLowerCase() === cleanEmail)) {
        return res.status(409).json({ message: `Email "${cleanEmail}" is already registered` });
      }
      users[index].email = cleanEmail;
    }

    if (full_name) {
      users[index].full_name = String(full_name).trim();
      const [fName, ...lName] = users[index].full_name.split(" ");
      users[index].firstName = fName;
      users[index].lastName = lName.join(" ");
    }

    if (role) users[index].role = role === "admin" ? "admin" : "seller";
    if (status) users[index].status = status === "disabled" ? "disabled" : "active";
    if (max_discount !== undefined) {
      users[index].max_discount = Math.min(100, Math.max(0, Number(max_discount) || 0));
    }
    if (monthly_target !== undefined) {
      users[index].monthly_target = Math.max(0, Number(monthly_target) || 0);
    }

    users[index].updatedAt = new Date().toISOString();
    await writeCollection("users", users);

    res.json({ message: "User updated successfully", user: safeUser(users[index]) });
  } catch (err) {
    console.error("UPDATE USER ERROR:", err);
    res.status(500).json({ message: "Failed to update user" });
  }
});

/** Enable / Disable user (Admin only) */
router.patch("/:id/status", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { status } = req.body;
    if (!["active", "disabled"].includes(status)) {
      return res.status(400).json({ message: 'Status must be "active" or "disabled"' });
    }

    const users = await readCollection("users");
    const index = users.findIndex((u) => u.id === userId && !u.deleted_at);

    if (index === -1) {
      return res.status(404).json({ message: "User not found" });
    }

    users[index].status = status;
    users[index].updatedAt = new Date().toISOString();
    await writeCollection("users", users);

    res.json({ message: `User status changed to ${status}`, user: safeUser(users[index]) });
  } catch (err) {
    res.status(500).json({ message: "Failed to update status" });
  }
});

/** Reset user password (Admin only) */
router.patch("/:id/password", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { password } = req.body;

    if (!password || String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const users = await readCollection("users");
    const index = users.findIndex((u) => u.id === userId && !u.deleted_at);

    if (index === -1) {
      return res.status(404).json({ message: "User not found" });
    }

    users[index].passwordHash = await bcrypt.hash(String(password), 10);
    users[index].updatedAt = new Date().toISOString();
    await writeCollection("users", users);

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to reset password" });
  }
});

/** Soft delete user (Admin only) */
router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const users = await readCollection("users");
    const index = users.findIndex((u) => u.id === userId && !u.deleted_at);

    if (index === -1) {
      return res.status(404).json({ message: "User not found" });
    }

    users[index].deleted_at = new Date().toISOString();
    users[index].status = "disabled";
    users[index].updatedAt = new Date().toISOString();
    await writeCollection("users", users);

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user" });
  }
});

export default router;
