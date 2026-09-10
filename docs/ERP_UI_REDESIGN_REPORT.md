# ERP / POS Management UI Redesign Report

**Date:** 2026-07-20  
**App:** `1990-pos`  
**Backend / Website:** unchanged

---

## Final confirmation

**POS is now a complete ERP + POS management system** for day-to-day operations:

- Professional table-first catalog management  
- Inventory, orders, customers, coupons, reviews, marketing, reports, media, settings  
- Existing POS sell / cart / payments / shifts / barcodes retained  
- Same shared `ashbackend1-main` APIs only  

---

## Missing features restored / upgraded

| Area | Restored / upgraded |
|------|---------------------|
| Products | Data table default, grid toggle, filters, sort, pagination, density, column visibility, bulk actions, export, duplicate, view, full tabbed Add/Edit dialog |
| Product form tabs | General, Pricing, Inventory, Variants, Images, SEO, Advanced |
| Inventory | SKU table with stock / reserved / available / location / barcode / adjust |
| Orders | Status colors, filters, timeline, invoice print, refund/cancel |
| Customers | Table, lifetime value, purchase history |
| Coupons | Full CRUD + Add Coupon |
| Reviews | Approve / Reject (local moderation) + Delete |
| Announcements | Edit + live preview + clear/delete |
| Popup | Edit + preview + scheduling UI + clear/delete |
| Reports | Charts for revenue / top products + returns / customers |
| Media | Folders, preview, upload to product gallery |
| Settings | Store / Brand / Shipping / Payment / Taxes / Notifications |
| Design | Luxury 1990 branding, dark mode toggle, desktop-first ERP chrome |

---

## Files modified / added (high level)

### Added
- `src/components/erp/{page-header,toolbar,data-table,status-badge}.tsx`
- `src/lib/product-meta.ts`
- `ERP_UI_REDESIGN_REPORT.md`

### Reworked
- `src/components/manage/ProductFormDialog.tsx` (tabbed ERP editor)
- `src/app/(pos)/products/page.tsx`
- `src/app/(pos)/inventory/page.tsx`
- `src/app/(pos)/orders/page.tsx`
- `src/app/(pos)/customers/page.tsx`
- `src/app/(pos)/reviews/page.tsx`
- `src/app/(pos)/announcements/page.tsx`
- `src/app/(pos)/popup/page.tsx`
- `src/app/(pos)/reports/page.tsx`
- `src/app/(pos)/media/page.tsx`
- `src/app/(pos)/settings/page.tsx`
- `src/app/(pos)/coupons/page.tsx` (header polish)
- `src/components/layout/pos-shell.tsx` (dark mode)
- `src/components/ui/dialog.tsx` (wide dialogs)
- `src/app/globals.css` (`.dark` theme)

---

## APIs reused

`/products`, `/products/:id`, `/products/inventory`, `/products/:id/inventory`, `/categories`, `/brands`, `/orders`, `/orders/:id`, `/orders/:id/return`, `/promo`, `/reviews`, `/announcement`, `/popup`, `/stats`, `/notifications/*`, `/platform`, `/auth/customers`

No new backend routes. No website changes.

---

## Honest gaps (no backend APIs)

These are shown in UI but cannot fully persist server-side without new APIs:

- True reserved stock / transfers / stock history  
- Review approve/reject persistence (local marker only; delete is real)  
- Popup server-side scheduling (schedule stored locally)  
- Dedicated media delete/folders API (upload via product gallery)  
- Shipping / tax engine APIs (local settings notes)  
- Cost / sale / featured / SEO (persisted via product `tags` meta channel, not first-class DB columns)

---

## Verification

- `npx tsc --noEmit` — pass after fixes  
- Existing POS sell flows untouched in route structure  
- Single inventory/orders/products source of truth retained  
