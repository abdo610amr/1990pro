# 1990 Integration Audit Report

**Date:** 2026-07-19  
**Workspace folders:** `1919-store` (package `1990-store`), `1919-admin` (package `1990-admin`), `1990-pos`, `ashbackend1-main`

---

## Verdict

**TRUE** — Any sale from the POS or Website (and any Admin cancel/delete/inventory edit) affects the **exact same** inventory, orders, customers (by email), reports/stats, and JSON database under `ashbackend1-main/data/`.

Admin does **not** place retail sales itself; it manages the same shared backend.

---

## Shared backend confirmation

| Client | Config | Target |
|--------|--------|--------|
| Website (`1919-store`) | `NEXT_PUBLIC_API_URL` → `http://localhost:5000/api` | Same |
| Admin (`1919-admin`) | `VITE_API_URL` → `http://localhost:5000/api` | Same |
| POS (`1990-pos`) | `NEXT_PUBLIC_API_URL` → `http://localhost:5000/api` | Same |

**Single source of truth:** `ashbackend1-main/data/`  
(`products.json`, `orders.json`, `users.json`, `promos.json`, `reviews.json`, `categories.json`, `brands.json`, `announcement.json`, `popup.json`, `notifications.json`, `notification-log.json`)

No duplicate product/order/inventory stores in the three apps. POS keeps **local-only** shift/cash-drawer/gift-card/offline-queue UI state; sales sync through `POST /api/orders`.

---

## Module status

### Backend / database
| Item | Status |
|------|--------|
| Single JSON data directory | ✅ Connected |
| No duplicated MySQL/Supabase inventory | ✅ Connected |

### Products
| Item | Status |
|------|--------|
| Admin create/edit → Website | ✅ Connected (`GET /products`) |
| Admin create/edit → POS | ✅ Connected (`GET /products`, `/products/search`) |
| Price / images / sizes / colors / stock / categories / brands | ✅ Connected (via product + category + brand APIs) |
| Admin brands management UI | ⚠ Missing Admin UI (API exists: `/api/brands`) |

### Inventory sync
| Workflow | Status |
|----------|--------|
| Admin add product → Website + POS | ✅ Connected |
| Admin edit quantity → Website + POS | ✅ Connected (`PATCH /products/:id/inventory`) |
| POS sell → stock decreases everywhere | ✅ Connected (`POST /orders` + `decrementStock`) |
| Website purchase → stock decreases everywhere | ✅ Connected |
| Qty 0 → sold out everywhere | ✅ Connected (`stockStatus`) |
| Cancel order → stock restored | ✅ Connected (**fixed** this audit) |
| Return → stock restored | ✅ Connected (**fixed** this audit: `POST /orders/:id/return`) |

**Live API test (2026-07-19):** POS sale → Website sale → cancel → return restored stock `48 → 47 → 46 → 47 → 48`. `INTEGRATION_SYNC=True`.

### Orders
| Item | Status |
|------|--------|
| Website order → Admin / POS / Backend | ✅ Connected (`GET /orders`) |
| POS sale → Admin / POS Orders / Backend | ✅ Connected |
| Website customer history includes matching-email POS sales | ✅ Connected (`GET /auth/orders` filters by email) |
| Reports include Website + POS | ✅ Connected (`/stats` + `/orders`; POS Today’s sales from shared orders) |
| Admin-placed retail sale | ⚠ N/A — Admin has no sell screen |

### Coupons
| Item | Status |
|------|--------|
| Admin create promo | ✅ Connected (`/promo`) |
| Website apply | ✅ Connected (`/promo/apply`) |
| POS apply | ✅ Connected (`/promo/apply`) |

### Customers
| Item | Status |
|------|--------|
| Website register → `users.json` | ✅ Connected |
| POS sees registered website accounts | ✅ Connected (**fixed**: `GET /auth/customers`) |
| Purchase history sync (by email) | ✅ Connected |

### Reports / analytics
| Item | Status |
|------|--------|
| Admin dashboard stats | ✅ Connected (`/stats` over all orders) |
| POS reports today’s sales (web + POS) | ✅ Connected |
| Employee rankings | ⚠ Local shift history only (no staff analytics API) |

### Reviews
| Item | Status |
|------|--------|
| Website display | ✅ Connected |
| Website submit → Admin | ✅ Connected (**fixed**: product review form → `POST /reviews`) |

### Notifications
| Item | Status |
|------|--------|
| New website orders | ✅ Connected (`new_order` log) |
| New POS sales | ✅ Connected (**improved**: `source: pos` → `pos_sale` log) |
| Returns / cancels | ✅ Connected (**fixed**: `notifyReturn`) |
| Low / out of stock | ✅ Connected |

### Announcements
| Item | Status |
|------|--------|
| Admin Announcement Bar → Website | ✅ Connected (**fixed**: store `AnnouncementBar`) |

### Popups
| Item | Status |
|------|--------|
| Admin Popup Manager → Website | ✅ Connected (**fixed**: store `StorePopup`) |

### Authentication
| Actor | System | Status |
|-------|--------|--------|
| Website users | JWT `/api/auth/*` + `users.json` | ✅ Connected |
| POS staff | **Reuses customer JWT** `/api/auth/login` | ⚠ Missing dedicated staff/role auth |
| Admin users | **No login** — open dashboard | ❌ Not Connected (separate admin auth missing) |

### Payments
| Method | Status |
|--------|--------|
| Cash | ✅ Connected (same `POST /orders`) |
| InstaPay | ✅ Connected (same order + optional screenshot) |
| Card | ✅ Connected (same order record) |
| Gift card / store credit (POS UI) | ⚠ Missing Backend API |

---

## Files modified (this audit)

### Backend (`ashbackend1-main`)
- `lib/inventory.js` — added `restoreStock`
- `routes/orderRoutes.js` — restore on cancel/delete; `POST /:id/return`; order `source` + `stockRestored`
- `routes/authRoutes.js` — `GET /auth/customers`
- `services/notificationService.js` — `notifyReturn`; POS vs website order log types; status-change log

### Website (`1919-store`)
- `src/app/layout.tsx` — announcement + popup
- `src/components/layout/announcement-bar.tsx` — **new**
- `src/components/layout/store-popup.tsx` — **new**
- `src/lib/api-client.ts` — review/announcement/popup helpers
- `src/components/product/product-detail.tsx` — review submit form
- `src/app/checkout/page.tsx` — `source: website`

### POS (`1990-pos`)
- `src/lib/api.ts` — `returnOrder`, `customers`
- `src/app/(pos)/sell/page.tsx` — `source: pos`
- `src/app/(pos)/returns/page.tsx` — uses backend restock API
- `src/app/(pos)/customers/page.tsx` — registered users + order-derived CRM

### Admin
- No code changes required for shared inventory/orders (already on same API). Cancel now restores stock via backend.

---

## APIs reused

`/health`, `/auth/login|register|me|orders`, `/products`, `/products/search`, `/products/inventory`, `/products/:id/inventory`, `/categories`, `/brands`, `/orders`, `/orders/:id`, `/orders/:id/stock-check`, `/promo`, `/promo/apply`, `/reviews`, `/stats`, `/announcement`, `/popup`, `/notifications/*`

## APIs added

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/orders/:id/return` | Return + restock |
| `GET` | `/api/auth/customers` | List registered customers for POS |

## Remaining missing backend / product features

1. **Dedicated Admin authentication** (login, roles, protected routes)
2. **Dedicated POS staff authentication** (roles beyond customer JWT)
3. **Admin Brands management UI** (API exists)
4. **Gift card / store credit ledger APIs**
5. **Staff / employee sales analytics API** (POS uses local shifts)
6. **Realtime websockets** (clients poll/refetch; not push)
7. **Partial line-item return UI** still sends full order lines from POS (backend supports partial payload)

---

## Confirmation statement

> "Any sale from the POS, Website, or Admin affects the exact same inventory, orders, customers, reports, and database."

**TRUE** for POS + Website sales and Admin inventory/order management against `ashbackend1-main/data/`.  
Admin does not create POS-style sales, but cancel/return/inventory edits mutate the same shared store.
