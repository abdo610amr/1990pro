# 1990 Store on Odoo eCommerce — Build Plan

**Date:** 2026-08-27
**Decision:** Build the storefront as a **native Odoo eCommerce website** (not a headless Next.js site). Odoo owns catalog, inventory, orders, customers, payments, and the storefront itself.

> This supersedes the earlier headless "Website ⇄ Odoo integration" approach. Going native means **there is no integration layer to build or maintain** — no product/stock sync, no order→SO bridge, no idempotency/dedup plumbing. Everything is one system.

---

## 1. Why native (recap)

- Catalog, `stock.quant`, `sale.order`, `res.partner`, EGP pricelist, VAT, delivery, invoicing, coupons, customer portal (order tracking + returns), SEO — **all built-in and always in sync**.
- One system to host, secure, back up, update. Unified reporting with the ERP.
- Trade-off accepted: the bespoke Next.js frontend is retired; storefront design is done via an Odoo theme.

---

## 2. What becomes legacy

| Component | Status after cut-over |
|---|---|
| `1919-store` (Next.js storefront) | **Retired.** Reuse only its design tokens/copy/images as theme reference. |
| `1919-backend` catalog/orders (JSON) | **Retired for the website.** Odoo replaces it. |
| `1919-backend` — POS endpoints | ⚠️ **Still in use by the POS** — see §9. Don't delete until POS is addressed. |
| `ODOO_INTEGRATION_PLAN.md` (headless) | Superseded by this document. |

The EGP/currency + backend hardening commits already made are harmless to keep; the backend order changes still benefit the POS while it runs on the JSON backend.

---

## 3. Odoo apps required

- **Website** + **eCommerce**
- **Inventory**
- **Sales** (Invoicing for VAT invoices)
- **Contacts**
- (Optional) **POS** — if you later unify the POS onto Odoo (§9)

Community edition covers eCommerce; confirm whether you need Enterprise for any specific feature (e.g. advanced website builder blocks, some payment providers). Target Odoo 17/18.

---

## 4. Egypt / business configuration

| Area | Setup |
|---|---|
| **Currency** | Company currency **EGP**; EGP pricelist as the website pricelist. |
| **VAT** | Egypt tax 14% (or your rate). Decide **tax-inclusive** display for retail (matches the storefront); configure fiscal position accordingly. |
| **Cash on Delivery** | Enable COD delivery/payment. Native. |
| **InstaPay / bank transfer** | Not a native acquirer. Use a **manual/"wire transfer" payment provider** labelled InstaPay, with pay-to details on the confirmation page. For the **screenshot upload**, either (a) small custom field on the order, or (b) collect it in the customer portal / by message. Order stays unpaid → staff confirms. |
| **Delivery methods** | Standard + Express as delivery methods with EGP prices; free-shipping rule over the threshold. **Confirm the real EGP numbers** (placeholder: 50 / 100 / free over 2000). |
| **Languages** | Add Arabic if needed (RTL). |

---

## 5. Catalog model in Odoo

| Concept | Odoo mapping |
|---|---|
| Product | `product.template`, published to website |
| Size options | Product **attribute "Size"** → generates `product.product` variants |
| SKU / barcode | `default_code` / `barcode` per variant |
| Brand | eCommerce category **or** a "Brand" attribute/tag + brand pages |
| Category | eCommerce categories (mirror your current categories) |
| Images | Main image + extra media per template/variant |
| Stock | `qty_available` per variant; enable "out of stock" handling / continue-selling rules |
| Originals vs brand | website category or product tag for filtering |

---

## 6. Data migration (existing catalog → Odoo)

Your current catalog lives in `1919-backend/data/products.json` (+ `categories.json`, `brands.json`, images under `uploads/`).

1. **Categories & brands** first (so products can reference them).
2. **Products** — build CSV(s) or a script (Odoo **XML-RPC/JSON-RPC**) to create `product.template` + variants with SKU/barcode/price/stock.
3. **Images** — import via base64 in the same script or attach afterward.
4. **Initial stock** — set via inventory adjustment (this is the point where Odoo becomes the stock source of truth).
5. **Customers/past orders** — optional; import `res.partner` by email if you want history.

A one-off Node/Python script reading the JSON and pushing over XML-RPC is the least error-prone path. I can write it.

---

## 7. Theme & design

- Start from a clean Odoo theme; apply brand **colors, fonts, logo**.
- Pull design tokens from the retired Next site: `1919-store/src/app/globals.css` (CSS variables/colors) and font choices — reuse the palette so the Odoo site stays on-brand.
- Rebuild key pages with the website builder: home (hero/carousel), shop/category, product page, brand pages.
- Accept that heavy animations from the Next build won't port 1:1; prioritise the pieces that carry the brand (typography, color, product presentation).

---

## 8. Checkout / operations

- Enable guest checkout + optional accounts (customer portal gives order tracking & returns for free).
- Configure COD + InstaPay, delivery methods, coupons/promos (maps your current promo codes).
- Order flow: website order → `sale.order` → confirm → delivery → invoice. Returns via return picking / credit note.
- Low-stock / out-of-stock behaviour configured per product.

---

## 9. POS dependency (flag — currently out of scope)

The POS still reads products/orders from `1919-backend`'s JSON. Once inventory is authoritative in Odoo, the POS will drift unless it also uses Odoo. Two options, to decide later:
- **Move POS to Odoo POS** (fully unified stock — cleanest), or
- **Keep the custom POS but point it at Odoo** (POS reads Odoo stock, posts sales as Odoo orders).

Not blocking the website launch, but plan it before go-live so stock stays correct across channels.

---

## 10. Suggested order of work

1. Stand up Odoo (apps in §3), set EGP + VAT + company.
2. Configure payments (COD, InstaPay) + delivery methods (§4).
3. Create the Size attribute + category/brand structure (§5).
4. Migrate catalog + images + initial stock (§6).
5. Theme the website + build core pages (§7).
6. Configure checkout, promos, emails (§8).
7. Test end-to-end: order → SO → stock decrement → delivery → invoice.
8. Address the POS (§9), then cut over DNS and retire the Next store/JSON catalog.

---

## Open items I need from you

1. Odoo hosting: **Odoo Online (SaaS), Odoo.sh, or self-hosted**? (affects how much custom code is allowed — e.g. InstaPay screenshot field).
2. Community vs Enterprise.
3. Real EGP shipping tiers + free-shipping threshold, and VAT inclusive vs added.
4. Arabic/RTL needed?
5. POS direction (§9).

Tell me the hosting choice and I can start on the **catalog migration script** (JSON → Odoo via XML-RPC) — that's the highest-value, reusable first step.
