import express from "express";
import * as notify from "../services/notificationService.js";

const router = express.Router();

// --- Settings ---------------------------------------------------------------
router.get("/settings", async (_req, res) => {
  try {
    res.json(await notify.getSettings());
  } catch (err) {
    res.status(500).json({ message: "Failed to load notification settings" });
  }
});

router.put("/settings", async (req, res) => {
  try {
    const { enabled, provider, emails } = req.body;
    const updated = await notify.saveSettings({ enabled, provider, emails });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message || "Failed to save settings" });
  }
});

// --- Test email -------------------------------------------------------------
router.post("/test", async (_req, res) => {
  try {
    const result = await notify.sendTest();
    res.json({ message: `Test email sent to ${result.recipients.length} recipient(s)` });
  } catch (err) {
    res.status(400).json({ message: err.message || "Failed to send test email" });
  }
});

// --- Dashboard notification log --------------------------------------------
router.get("/log", async (_req, res) => {
  try {
    res.json(await notify.listLog());
  } catch (err) {
    res.status(500).json({ message: "Failed to load notifications" });
  }
});

router.get("/log/unread-count", async (_req, res) => {
  try {
    res.json({ count: await notify.getUnreadCount() });
  } catch (err) {
    res.status(500).json({ message: "Failed to count notifications" });
  }
});

router.patch("/log/read-all", async (_req, res) => {
  try {
    const count = await notify.markAllRead();
    res.json({ message: `Marked ${count} as read` });
  } catch (err) {
    res.status(500).json({ message: "Failed to update notifications" });
  }
});

router.patch("/log/:id/read", async (req, res) => {
  try {
    const entry = await notify.markRead(req.params.id);
    if (!entry) return res.status(404).json({ message: "Notification not found" });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: "Failed to update notification" });
  }
});

router.delete("/log", async (_req, res) => {
  try {
    await notify.clearLog();
    res.json({ message: "Notifications cleared" });
  } catch (err) {
    res.status(500).json({ message: "Failed to clear notifications" });
  }
});

export default router;
