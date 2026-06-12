# BI DOM Frontend

Next.js dashboard client for DOM Social Hub Business Intelligence. The app connects to the Laravel backend API and provides operational views for analytics, CSV imports, invoice lookup, master product setup, and recipe-based inventory forecasting.

## Core Features

- **Login portal:** manager/kasir authentication against the backend API.
- **BI dashboard:** revenue, COGS, net profit, category charts, top products, peak hours, market basket, and KPI views.
- **Dynamic slicers:** filter dashboard data by date range and product category.
- **Line chart drill-through:** click revenue chart points to inspect transactions for that period, then open receipt details.
- **Auto refresh indicator:** dashboard data refreshes automatically and shows the last refresh time.
- **CSV import page:** imports receipt-level transaction data into the backend.
- **Import result review:** shows imported, duplicate, and rejected receipt counts after upload.
- **Invoice page:** invoice list and detail modal with payment method visibility.
- **Master Product page:** create, edit, delete, search, paginate, and filter menu products by category.
- **Recipe management:** assign required inventory materials and usage quantity to every menu product.
- **Inventory Alert page:** paginated live material monitoring with forecasted usage, usage basis labels, critical status, inbound stock update, and material creation.
- **Search support:** Master Product and Inventory Alert both include search inputs for faster demo and daily usage.
- **Filtered dashboard report export:** PDF export follows the active dashboard year/month, date range, and category filters for presentation handoff.

## Backend Integration

Configure the API base URL in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
```

The frontend runs on:

```text
http://localhost:3000
```

The backend API should run on:

```text
http://127.0.0.1:8000/api/v1
```

Opening `http://127.0.0.1:8000/api/v1` directly returns `404` because it is an API prefix, not a page.

## Inventory Forecasting UX

Inventory Alert is connected to the full transaction and product flow:

1. Master Product stores menu item recipes.
2. CSV Import sends sold products and quantities to the backend.
3. Backend reduces current stock based on each product's recipe.
4. Inventory Alert uses the latest imported transaction date as the end of its 30-day SMA data window.
5. Inventory Alert shows current stock, predicted usage, usage basis, and `Aman` / `Kritis` status.
6. Search helps filter by material name, unit, or status.

The visible `Data_Window` label shows which imported transaction period is being used for the forecast.

`EST_USAGE` labels:

- `SMA_30D`: forecast is based on recipe material usage from the last 30 days.
- `NO_USAGE_HISTORY`: this material has not been used by itemized transactions in the last 30 days, so estimated usage is `0`.
- `TRX_AVG_FALLBACK`: fallback estimate from `usage_per_trx` because recipe-based transaction history is not available yet.

Master Product cannot be saved until at least one valid recipe material is configured. This keeps sales import, stock deduction, and forecasting connected.

Master Product search can filter by:

- product name
- category name
- category ID
- recipe material name

Inventory Alert search can filter by:

- material name
- unit
- status (`Aman` or `Kritis`)

## Demo CSV

Use the backend sample file for manual demo import:

```text
database/samples/import-transactions-dom-menu-inventory-alert-demo-fresh.csv
```

The file uses receipt prefix `DOM-DEMO-PRESENT-*`, so it remains importable as long as it has not been imported before in the current database.

If a CSV contains a product name that does not match Master Product, only that receipt is rejected. Other valid receipts still become invoices and update inventory forecast history.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- TanStack React Query
- Axios
- Framer Motion
- Lucide React
- Sonner
- Chart.js / react-chartjs-2

## Project Structure

```text
bi-dom-frontend/
app/          # App Router pages
components/   # Shared UI components
hooks/        # React Query hooks and page logic
lib/          # Axios and utility setup
types/        # TypeScript API types
middleware.ts # Route protection
```

## Local Development

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev -- -p 3000
```

Build production bundle:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

## Copyright

Copyright (c) 2026 Fredy Fajar Adi Putra. All Rights Reserved.
