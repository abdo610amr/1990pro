# ASH Admin Dashboard

Professional admin dashboard for the ASH e-commerce backend.

## Tech Stack

- React + Vite + TypeScript
- Tailwind CSS v4
- Shadcn UI (Radix primitives)
- React Router
- Axios

## Prerequisites

- Node.js 18+
- Backend API running at `http://localhost:5000`

## Setup

```bash
cd admin-dashboard
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:5000/api` | Backend API base URL |

## Features

- **Dashboard** — Store overview with stats and recent orders
- **Products** — CRUD with image upload (cover + gallery)
- **Orders** — View, status updates, payment screenshots
- **Coupons** — Create and manage promo codes
- **Reviews** — Moderate customer reviews

## API Endpoints Used

| Module | Endpoints |
|--------|-----------|
| Products | `GET/POST /products`, `GET/PUT/DELETE /products/:id` |
| Orders | `GET /orders`, `PUT /orders/:id`, `DELETE /orders/:id` |
| Coupons | `GET/POST /promo`, `DELETE /promo/:id` |
| Reviews | `GET /reviews`, `DELETE /reviews/:id` |

## Project Structure

```
src/
├── components/
│   ├── layout/       # Sidebar, AdminLayout
│   ├── shared/       # LoadingState, ErrorState, EmptyState
│   ├── products/     # ProductFormDialog
│   ├── orders/       # OrderDetailsDialog
│   ├── coupons/      # PromoFormDialog
│   └── ui/           # Shadcn UI primitives
├── pages/            # Route pages
├── services/         # Axios API layer
├── types/            # TypeScript interfaces
├── hooks/            # useAsyncData
└── lib/              # Utilities
```

## Scripts

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run preview` — Preview production build
