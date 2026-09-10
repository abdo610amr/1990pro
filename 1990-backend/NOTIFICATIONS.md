# Email Notification Center

Email alerts via **Resend** + an in-dashboard notification bell. Built to be
provider-agnostic (Resend today; Brevo / Mailgun / Amazon SES are scaffolded).

## Setup

1. Copy `.env.example` to `.env` and set your key (a working `.env` is already
   included):

   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   NOTIFICATION_FROM=Store Notifications <onboarding@resend.dev>
   ```

   The key is **only** read from the environment — it is never hardcoded or sent
   to the browser.

2. Start the backend: `npm run dev` (or `npm start`). Requires **Node 18+**
   (uses the built-in `fetch`).

3. Start the dashboard: `cd admin-dashboard && npm run dev`
   (or `npm run build` to refresh `dist/`). Requires **Node 20+** for Vite.

## Resend sending rule (important)

Until you verify a domain at <https://resend.com/domains>, Resend only delivers
to **your own account email**. To send to arbitrary recipients, verify a domain
and change `NOTIFICATION_FROM` to an address on that domain (e.g.
`orders@yourbrand.com`). The Test Email button surfaces this message if it applies.

## Using it

Dashboard → **Notifications**:

- Enable/disable notifications
- Add / remove unlimited recipient emails
- Pick the provider (Resend active)
- **Send Test Email** (works even while disabled, so you can verify setup)

The **bell** in the top bar shows unread count, lists New Order / Low Stock /
Out Of Stock events, and supports mark-as-read and clear.

## Events that send email

| Event | Subject | Trigger |
|-------|---------|---------|
| New Order | `🛒 New Order #N` | order created (incl. payment screenshot note) |
| Low Stock | `Low Stock Alert` | a variant drops to/below its `lowStockThreshold` |
| Out Of Stock | `Out Of Stock Alert` | a variant reaches 0 |
| Order Status Changed | `Order #N status: X` | order status changes |

Stock alerts only fire for the variants touched by the order, so already-low
items don't re-alert on every unrelated order.

## Architecture

```
routes/notificationRoutes.js   REST API (settings, test, log)
services/notificationService.js  ← the ONLY place emails are sent / events logged
services/resendProvider.js       Resend (REST, no SDK dependency)
services/providers/index.js      provider factory (resend|brevo|mailgun|ses)
services/providers/*Provider.js  future providers (stubs)
data/notifications.json          { enabled, provider, emails }
data/notification-log.json       dashboard bell records
lib/loadEnv.js                   zero-dependency .env loader
```

No route or controller talks to a provider directly — everything funnels through
`notificationService`. Email delivery is best-effort: a send failure never blocks
order creation or dashboard logging.

To add a provider: implement `send({ from, to, subject, html, text })` in a new
file and register it in `services/providers/index.js`.
