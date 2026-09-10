# Orders ERP Workflow Report

**Date:** 21 Jul 2026  
**Scope:** Shared backend + POS management + website product stock UX  
**Constraint:** No duplicate order/inventory stores — single `ashbackend1-main/data` JSON DB

---

## Summary

The order pipeline is now a retail ERP workflow:

`Pending → Preparing → Ready → Completed`  
(+ `Cancelled`, `Returned`)

| Channel | Initial status |
|---------|----------------|
| Website | **Pending** |
| POS sale | **Completed** (paid + fulfilled at counter) |

---

## Backend (`ashbackend1-main`)

### Status allowlist
`pending`, `preparing`, `ready`, `completed`, `cancelled`, `returned`

Legacy aliases (read/normalize):
- `confirmed` / `processing` → `preparing`
- `prepared` / `shipped` → `ready`
- `delivered` / `done` → `completed`
- `canceled` → `cancelled`
- `refunded` → `returned`

### Create (`POST /api/orders`)
- `source: "pos"` → status **`completed`** (+ `delivered_at`)
- Website / default → status **`pending`**
- Still decrements variant stock once on create

### Status update (`PUT /api/orders/:id`)
- Cancel from active pipeline restores inventory once (`stockRestored`)
- Restore cancelled → Pending re-deducts stock if it was restocked

### Return (`POST /api/orders/:id/return`)
- Restores inventory
- Sets status **`returned`** (no longer `cancelled`)

### Delete (`DELETE /api/orders/:id?restoreStock=`)
| Current status | Stock on delete |
|----------------|-----------------|
| Completed / Cancelled / Returned | **Never** changes stock |
| Pending / Preparing / Ready | Restores **only if** `restoreStock=true` |

### Stats (`GET /api/stats`)
Adds: `pendingOrders`, `preparingOrders`, `readyOrders`, `completedOrders`, `cancelledOrders`, `returnedOrders`, `todaySales`, `todayRevenue`  
Revenue counts **completed** orders only.

---

## POS (`1990-pos`)

### Orders page
- Tabs with live counters: Pending / Preparing / Ready / Completed / Cancelled / Returned
- Details dialog uses **action buttons** (not a free-form timeline):
  - Pending → Start Preparing, Cancel, Delete
  - Preparing → Ready For Pickup, Cancel
  - Ready → Complete Order, Print Invoice
  - Completed → Return, Print Invoice, Delete
  - Cancelled → Delete, Restore Order
  - Returned → Print Invoice, Delete
- Actions invalidate orders, stats, products, inventory (no full page reload)

### Dashboard
Cards: Pending / Preparing / Ready / Completed / Cancelled / Returned / Today’s Sales / Today’s Revenue (+ low/sold-out)

### Sell
Unchanged payload (`source: "pos"`); backend assigns **Completed**.

### Products view
Per-variant labels: Available / Low Stock / Out Of Stock (threshold = `lowStockThreshold`)

---

## Website (`1919-store`)

- Checkout still creates **Pending** (no status in payload; backend default)
- Product detail: each size shows **qty + Available / Low Stock / Out Of Stock**
- Add to Cart / Buy Now disabled only when the **selected** size is unavailable
- Product-level OUT OF STOCK only when **all** sizes are zero
- Account order badges include new statuses

---

## Smoke tests (API) — all passed

| Check | Result |
|-------|--------|
| Website order → Pending | PASS |
| POS order → Completed | PASS |
| Pending → Preparing → Ready → Completed | PASS |
| Cancel Pending → restores inventory | PASS |
| Return Completed → status Returned + restores inventory | PASS |
| Delete Completed → stock unchanged | PASS |
| Dashboard counter fields present | PASS |
| Variant stock fields on products | PASS |

---

## How to verify in UI

1. Backend: `ashbackend1-main` → `npm start` (port 5000)  
2. POS: `1990-pos` → `npm run electron:dev`  
3. Website: `1919-store` → `npm run dev`  
4. Place a website checkout → Orders **Pending** tab  
5. Complete a POS sale → Orders **Completed** tab  
6. Open Details → run workflow actions; watch tab counters + Dashboard update  

---

## Files touched

- `ashbackend1-main/routes/orderRoutes.js`
- `ashbackend1-main/routes/statsRoutes.js`
- `1990-pos/src/app/(pos)/orders/page.tsx`
- `1990-pos/src/app/(pos)/dashboard/page.tsx`
- `1990-pos/src/app/(pos)/products/page.tsx`
- `1990-pos/src/components/erp/status-badge.tsx`
- `1990-pos/src/lib/api.ts`
- `1990-pos/src/types/pos.ts`
- `1919-store/src/components/product/product-detail.tsx`
- `1919-store/src/lib/catalog-adapter.ts`
- `1919-store/src/types/index.ts`
- `1919-store/src/app/account/orders/page.tsx`
