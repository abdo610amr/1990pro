// notificationService — the ONE place email gets sent and dashboard
// notifications get recorded. No route/controller talks to a provider directly;
// they call the event helpers here (notifyNewOrder, notifyLowStock, ...).
import {
  readDocument,
  writeDocument,
  readCollection,
  writeCollection,
  getNextId,
} from "../lib/jsonStore.js";
import { getProvider, SUPPORTED_PROVIDERS } from "./providers/index.js";

const DEFAULT_SETTINGS = {
  enabled: false,
  provider: "resend",
  emails: [],
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fromAddress() {
  return process.env.NOTIFICATION_FROM || "Store Notifications <onboarding@resend.dev>";
}

function sanitizeEmails(emails) {
  const seen = new Set();
  const result = [];
  for (const raw of emails) {
    const email = String(raw).trim().toLowerCase();
    if (!email || !EMAIL_RE.test(email) || seen.has(email)) continue;
    seen.add(email);
    result.push(email);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------
export async function getSettings() {
  const stored = await readDocument("notifications", DEFAULT_SETTINGS);
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function saveSettings(input = {}) {
  const current = await getSettings();

  const provider = input.provider
    ? String(input.provider).toLowerCase()
    : current.provider;

  if (!SUPPORTED_PROVIDERS.includes(provider)) {
    throw new Error(
      `Unsupported provider "${provider}". Supported: ${SUPPORTED_PROVIDERS.join(", ")}`
    );
  }

  const next = {
    enabled:
      typeof input.enabled === "boolean" ? input.enabled : current.enabled,
    provider,
    emails: Array.isArray(input.emails)
      ? sanitizeEmails(input.emails)
      : current.emails,
  };

  await writeDocument("notifications", next);
  return next;
}

// ---------------------------------------------------------------------------
// Core dispatch — every outbound email funnels through here.
// ---------------------------------------------------------------------------
async function dispatch({ subject, html, text }, { force = false } = {}) {
  const settings = await getSettings();

  if (!settings.enabled && !force) {
    return { skipped: true, reason: "Notifications are disabled" };
  }
  if (!settings.emails.length) {
    return { skipped: true, reason: "No recipient emails are configured" };
  }

  const provider = getProvider(settings.provider);
  const result = await provider.send({
    from: fromAddress(),
    to: settings.emails,
    subject,
    html,
    text,
  });

  return { skipped: false, recipients: settings.emails, result };
}

// Best-effort send for automated events: a delivery failure must never block
// dashboard logging or other notifications. (Test emails use dispatch directly
// so the failure reason can be surfaced to the user.)
async function safeSend(payload) {
  try {
    return await dispatch(payload);
  } catch (err) {
    console.log("Notification send failed:", err.message);
    return { skipped: true, reason: err.message, error: true };
  }
}

export async function sendCustomerEmail({ to, subject, html, text }) {
  const recipients = sanitizeEmails([to]);
  if (!recipients.length) throw new Error("A valid recipient email is required");
  const settings = await getSettings();
  if (!settings.enabled) {
    return { skipped: true, reason: "Notifications are disabled" };
  }
  const provider = getProvider(settings.provider);
  const result = await provider.send({
    from: fromAddress(),
    to: recipients,
    subject,
    html,
    text,
  });
  return { skipped: false, recipients, result };
}

// ---------------------------------------------------------------------------
// Dashboard notification log
// ---------------------------------------------------------------------------
async function addLogEntry({ type, title, message, meta = null }) {
  const log = await readCollection("notificationLog");
  const entry = {
    id: getNextId(log),
    type,
    title,
    message,
    meta,
    read: false,
    createdAt: new Date().toISOString(),
  };
  log.push(entry);
  await writeCollection("notificationLog", log);
  return entry;
}

export async function listLog() {
  const log = await readCollection("notificationLog");
  return log.sort((a, b) => b.id - a.id);
}

export async function getUnreadCount() {
  const log = await readCollection("notificationLog");
  return log.filter((entry) => !entry.read).length;
}

export async function markRead(id) {
  const log = await readCollection("notificationLog");
  const index = log.findIndex((entry) => entry.id === Number(id));
  if (index === -1) return null;
  log[index].read = true;
  await writeCollection("notificationLog", log);
  return log[index];
}

export async function markAllRead() {
  const log = await readCollection("notificationLog");
  const updated = log.map((entry) => ({ ...entry, read: true }));
  await writeCollection("notificationLog", updated);
  return updated.length;
}

export async function clearLog() {
  await writeCollection("notificationLog", []);
  return true;
}

// ---------------------------------------------------------------------------
// HTML helpers
// ---------------------------------------------------------------------------
function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function money(value) {
  const n = Number(value) || 0;
  return n.toFixed(2);
}

function layout(title, bodyHtml) {
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;background:#f4f4f7;font-family:Arial,Helvetica,sans-serif;color:#1a1a2e;">
    <div style="max-width:600px;margin:0 auto;padding:24px;">
      <div style="background:#1a1a2e;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0;">
        <h1 style="margin:0;font-size:18px;">${esc(title)}</h1>
      </div>
      <div style="background:#fff;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none;">
        ${bodyHtml}
      </div>
      <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:16px;">
        Automated message from your store's Notification Center.
      </p>
    </div>
  </body>
</html>`;
}

function row(label, value) {
  return `<tr>
    <td style="padding:6px 12px 6px 0;color:#6b7280;font-size:14px;white-space:nowrap;vertical-align:top;">${esc(label)}</td>
    <td style="padding:6px 0;font-size:14px;font-weight:600;">${value}</td>
  </tr>`;
}

// ---------------------------------------------------------------------------
// Event helpers (called by routes)
// ---------------------------------------------------------------------------
export async function notifyNewOrder(order) {
  const items = Array.isArray(order.items) ? order.items : [];

  const itemRows = items
    .map(
      (item) => `<tr>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0;font-size:13px;">
          ${item.brand_name || item.brandName ? `<strong style="color:#5E0F1D;">[${esc(item.brand_name || item.brandName)}]</strong> ` : ""}
          ${esc(item.name)}
          ${item.barcode ? `<br/><span style="font-size:11px;color:#888;">Barcode: ${esc(item.barcode)}</span>` : ""}
        </td>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0;font-size:13px;">${esc(item.variant ?? item.size ?? "-")}</td>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0;font-size:13px;text-align:center;">${esc(item.quantity)}</td>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0;font-size:13px;text-align:right;">${money(item.price)}</td>
      </tr>`
    )
    .join("");

  const screenshotNote = order.paymentScreenshot
    ? `<p style="margin:16px 0 0;padding:10px 12px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;font-size:13px;">
         📎 A payment screenshot was uploaded with this order:
         <a href="${esc(order.paymentScreenshot)}">${esc(order.paymentScreenshot)}</a>
       </p>`
    : `<p style="margin:16px 0 0;color:#9ca3af;font-size:13px;">No payment screenshot was uploaded.</p>`;

  const body = `
    <h2 style="margin:0 0 16px;font-size:16px;">Order #${esc(order.id)}</h2>
    <table style="width:100%;border-collapse:collapse;">
      ${row("Customer", esc(order.customerName))}
      ${row("Phone", esc(order.phone))}
      ${row("Email", esc(order.email))}
      ${row("Address", esc(order.address))}
      ${row("Payment Method", esc(order.payment_method))}
      ${row("Order Status", esc(order.status))}
    </table>

    <h3 style="margin:20px 0 8px;font-size:14px;">Products</h3>
    <table style="width:100%;border-collapse:collapse;">
      <tr style="background:#f9fafb;">
        <th style="padding:8px;text-align:left;font-size:12px;color:#6b7280;">Product</th>
        <th style="padding:8px;text-align:left;font-size:12px;color:#6b7280;">Variant</th>
        <th style="padding:8px;text-align:center;font-size:12px;color:#6b7280;">Qty</th>
        <th style="padding:8px;text-align:right;font-size:12px;color:#6b7280;">Price</th>
      </tr>
      ${itemRows || `<tr><td colspan="4" style="padding:8px;font-size:13px;color:#9ca3af;">No items</td></tr>`}
    </table>

    <p style="margin:16px 0 0;text-align:right;font-size:16px;font-weight:700;">
      Total: ${money(order.totalPrice)}
    </p>
    ${screenshotNote}
  `;

  const source = String(order.source || "website").toLowerCase();
  const sourceLabel =
    source === "pos" ? "POS sale" : source === "admin" ? "Admin order" : "Website order";

  await addLogEntry({
    type: source === "pos" ? "pos_sale" : "new_order",
    title: `${sourceLabel} #${order.id}`,
    message: `${order.customerName || "A customer"} placed a ${sourceLabel.toLowerCase()} — total ${money(order.totalPrice)}.`,
    meta: { orderId: order.id, total: order.totalPrice, source },
  });

  // Also send customer confirmation email if customer email is provided
  if (order.email && EMAIL_RE.test(String(order.email).trim())) {
    safeSend({
      subject: `Order Confirmation #${order.id} — 1990`,
      html: layout(`Thank you for your order #${order.id}!`, body),
      text: `Thank you for your order #${order.id}. Total ${money(order.totalPrice)}.`,
    }, { force: true }).catch((err) => console.log("Customer email send notice:", err.message));
  }

  return safeSend({
    subject: `🛒 ${sourceLabel} #${order.id}`,
    html: layout(`${sourceLabel} #${order.id}`, body),
    text: `${sourceLabel} #${order.id} from ${order.customerName} (${order.phone}). Total ${money(order.totalPrice)}.`,
  });
}

export async function notifyReturn(order, details = {}) {
  const type = details.type || "return";
  const reason = details.reason || "Inventory restored";

  await addLogEntry({
    type: "return",
    title: `Return / cancel #${order.id}`,
    message: `${reason} (${type}).`,
    meta: { orderId: order.id, type, source: order.source || "website" },
  });

  const body = `
    <table style="width:100%;border-collapse:collapse;">
      ${row("Order Number", `#${esc(order.id)}`)}
      ${row("Customer", esc(order.customerName))}
      ${row("Type", esc(type))}
      ${row("Reason", esc(reason))}
    </table>
  `;

  return safeSend({
    subject: `↩️ Return / cancel #${order.id}`,
    html: layout(`Return / Cancel #${order.id}`, body),
    text: `Order #${order.id} ${type}: ${reason}`,
  });
}

export async function notifyLowStock(items) {
  const list = Array.isArray(items) ? items : [items];
  if (!list.length) return { skipped: true, reason: "No low-stock items" };

  const rows = list
    .map(
      (i) => `<tr>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0;font-size:13px;">${esc(i.name)}</td>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0;font-size:13px;">${esc(i.variant ?? "-")}</td>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0;font-size:13px;text-align:center;">${esc(i.stock)}</td>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0;font-size:13px;text-align:center;">${esc(i.threshold)}</td>
      </tr>`
    )
    .join("");

  const body = `
    <p style="margin:0 0 16px;font-size:14px;">The following items have dropped to or below their low-stock threshold:</p>
    <table style="width:100%;border-collapse:collapse;">
      <tr style="background:#f9fafb;">
        <th style="padding:8px;text-align:left;font-size:12px;color:#6b7280;">Product</th>
        <th style="padding:8px;text-align:left;font-size:12px;color:#6b7280;">Variant</th>
        <th style="padding:8px;text-align:center;font-size:12px;color:#6b7280;">Current Stock</th>
        <th style="padding:8px;text-align:center;font-size:12px;color:#6b7280;">Threshold</th>
      </tr>
      ${rows}
    </table>
  `;

  for (const i of list) {
    await addLogEntry({
      type: "low_stock",
      title: "Low stock",
      message: `${i.name}${i.variant ? ` (${i.variant})` : ""} is low — ${i.stock} left (threshold ${i.threshold}).`,
      meta: i,
    });
  }

  return safeSend({
    subject: "Low Stock Alert",
    html: layout("Low Stock Alert", body),
    text: list
      .map((i) => `${i.name} (${i.variant}): ${i.stock} left, threshold ${i.threshold}`)
      .join("\n"),
  });
}

export async function notifyOutOfStock(items) {
  const list = Array.isArray(items) ? items : [items];
  if (!list.length) return { skipped: true, reason: "No out-of-stock items" };

  const rows = list
    .map(
      (i) => `<tr>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0;font-size:13px;">${esc(i.name)}</td>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0;font-size:13px;">${esc(i.variant ?? "-")}</td>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0;font-size:13px;">${esc(i.sku ?? "-")}</td>
      </tr>`
    )
    .join("");

  const body = `
    <p style="margin:0 0 16px;font-size:14px;">The following items are now <strong>out of stock</strong>:</p>
    <table style="width:100%;border-collapse:collapse;">
      <tr style="background:#f9fafb;">
        <th style="padding:8px;text-align:left;font-size:12px;color:#6b7280;">Product</th>
        <th style="padding:8px;text-align:left;font-size:12px;color:#6b7280;">Variant</th>
        <th style="padding:8px;text-align:left;font-size:12px;color:#6b7280;">SKU</th>
      </tr>
      ${rows}
    </table>
  `;

  for (const i of list) {
    await addLogEntry({
      type: "out_of_stock",
      title: "Out of stock",
      message: `${i.name}${i.variant ? ` (${i.variant})` : ""} is out of stock${i.sku ? ` — SKU ${i.sku}` : ""}.`,
      meta: i,
    });
  }

  return safeSend({
    subject: "Out Of Stock Alert",
    html: layout("Out Of Stock Alert", body),
    text: list
      .map((i) => `${i.name} (${i.variant}) is out of stock. SKU: ${i.sku ?? "-"}`)
      .join("\n"),
  });
}

export async function notifyStatusChange({ order, previousStatus, newStatus }) {
  await addLogEntry({
    type: "status_change",
    title: `Order #${order.id} → ${newStatus}`,
    message: `Status changed from ${previousStatus} to ${newStatus}.`,
    meta: { orderId: order.id, previousStatus, newStatus },
  });

  const body = `
    <table style="width:100%;border-collapse:collapse;">
      ${row("Order Number", `#${esc(order.id)}`)}
      ${row("Previous Status", esc(previousStatus))}
      ${row("New Status", `<span style="color:#1a7f37;">${esc(newStatus)}</span>`)}
    </table>
  `;

  return safeSend({
    subject: `Order #${order.id} status: ${newStatus}`,
    html: layout("Order Status Changed", body),
    text: `Order #${order.id} changed from ${previousStatus} to ${newStatus}.`,
  });
}

export async function sendTest() {
  const body = `
    <p style="font-size:14px;">✅ This is a test email from your store's Notification Center.</p>
    <p style="font-size:14px;color:#6b7280;">If you received this, your email notifications are configured correctly.</p>
  `;

  const result = await dispatch(
    {
      subject: "✅ Test Email — Notification Center",
      html: layout("Test Email", body),
      text: "This is a test email from your store's Notification Center. Email notifications are working.",
    },
    { force: true } // allow testing even while notifications are disabled
  );

  if (result.skipped) throw new Error(result.reason);
  return result;
}
