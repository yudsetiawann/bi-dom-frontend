# BI DOM Frontend

Frontend web dashboard untuk sistem **Business Intelligence DOM Social Hub**. Aplikasi ini menampilkan dashboard analytics, invoice ledger, import CSV transaksi, inventory forecasting, product & recipe management, serta export report PDF dari backend Laravel.

Project ini terhubung dengan repository backend: [`bi-dom-backend`](https://github.com/fredyyfajarr/bi-dom-backend).

---

## Ringkasan Fitur

- **Login & Role-Based Access**
  - Login menggunakan token dari Laravel Sanctum.
  - Token dan role disimpan di cookie.
  - Middleware frontend mengarahkan akses berdasarkan role:
    - `manager` masuk ke dashboard utama.
    - `kasir` diarahkan ke halaman invoice.

- **Central Analytics Dashboard**
  - KPI revenue, net profit, profit margin, dan total transaksi.
  - Grafik revenue per kategori.
  - Filter tahun dan drill-down bulan.
  - Toggle / exclude kategori pada visualisasi tertentu.
  - Top product, latest transaction, category donut chart, dan inventory alert.
  - Advanced analytics: daily revenue, peak hour heatmap, stacked category trend, dan market basket suggestion.

- **Invoice Receipts**
  - Tabel transaksi / struk.
  - Search receipt number.
  - Filter tanggal: all time, hari ini, bulan ini, tahun ini.
  - Sorting kolom dan pagination.
  - Modal detail transaksi.

- **Import CSV**
  - Upload file CSV transaksi dari POS.
  - Panduan format CSV langsung di halaman import.
  - Validasi file `.csv` sebelum upload.

- **Inventory Control**
  - Monitoring stok bahan baku.
  - Alert status stok kritis.
  - Estimasi pemakaian berdasarkan forecasting backend.
  - Tambah stok masuk.
  - Tambah master item inventory.

- **Master Catalog**
  - CRUD produk.
  - Input harga, kategori, dan resep / material produk.
  - Edit product & recipe management.

- **PDF Report Export**
  - Export laporan PDF dari endpoint backend.

---

## Tech Stack

- Next.js `16.2.4`
- React `19.2.4`
- TypeScript
- Tailwind CSS 4
- Axios
- TanStack React Query
- Chart.js + React Chart.js 2
- Framer Motion
- Lucide React
- Sonner Toast
- js-cookie

---

## Prasyarat

Pastikan sudah terinstall:

- Node.js
- npm
- Backend `bi-dom-backend` sudah berjalan

Backend default yang digunakan:

```txt
http://127.0.0.1:8000/api/v1
```

---

## Instalasi Lokal

Clone repository:

```bash
git clone https://github.com/fredyyfajarr/bi-dom-frontend.git
cd bi-dom-frontend
```

Install dependency:

```bash
npm install
```

Buat file environment lokal:

```bash
cp .env.example .env.local
```

Jika `.env.example` belum tersedia, buat manual file `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
```

Jalankan development server:

```bash
npm run dev
```

Buka aplikasi di browser:

```txt
http://localhost:3000
```

---

## Script NPM

| Command | Fungsi |
|---|---|
| `npm run dev` | Menjalankan development server |
| `npm run build` | Build aplikasi production |
| `npm run start` | Menjalankan hasil build production |
| `npm run lint` | Menjalankan ESLint |

---

## Environment Variable

| Variable | Contoh | Keterangan |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://127.0.0.1:8000/api/v1` | Base URL API backend Laravel |

Jika variable tidak diisi, aplikasi akan menggunakan fallback:

```txt
http://127.0.0.1:8000/api/v1
```

---

## Akun Demo

Akun demo berasal dari seeder backend.

| Role | Email | Password | Akses |
|---|---|---|---|
| Manager | `manager@dom.com` | `password123` | Dashboard, product, inventory, import, invoice, report |
| Kasir | `kasir@dom.com` | `password123` | Invoice dan import data transaksi |

> Untuk production, ubah credential demo di backend.

---

## Struktur Halaman Utama

| Route | Role | Keterangan |
|---|---|---|
| `/login` | Public | Halaman login |
| `/` | Manager | Central analytics dashboard |
| `/invoices` | Manager, Kasir | Daftar invoice / transaksi |
| `/import` | Manager, Kasir | Upload CSV transaksi |
| `/products` | Manager | Master catalog produk dan resep |
| `/inventory` | Manager | Inventory control dan forecasting |

---

## Integrasi Backend

Aplikasi menggunakan Axios instance di `lib/axios.ts`. Token dari cookie `auth_token` otomatis dikirim sebagai header:

```txt
Authorization: Bearer <token>
```

Pastikan backend sudah berjalan sebelum membuka frontend:

```bash
cd ../bi-dom-backend
php artisan serve
```

Lalu jalankan frontend:

```bash
cd ../bi-dom-frontend
npm run dev
```

---

## Format CSV Import

Halaman import membutuhkan file `.csv` dengan header berikut:

```csv
receipt_no,trx_date,product_name,qty,subtotal
```

Contoh:

```csv
receipt_no,trx_date,product_name,qty,subtotal
INV-001,2026-04-28 10:30,Aren Latte,2,40000
INV-001,2026-04-28 10:30,Mix Platter,1,35000
INV-002,2026-04-28 11:15,Lychee Tea,1,20000
```

Aturan penting:

- Data harus itemized per menu.
- Jika satu struk berisi tiga menu, tulis menjadi tiga baris dengan `receipt_no` yang sama.
- `subtotal` adalah harga item dikali qty.
- Jangan gunakan titik atau koma sebagai pemisah ribuan pada nominal.

---

## Build Production

Build aplikasi:

```bash
npm run build
```

Jalankan hasil build:

```bash
npm run start
```

---

## Troubleshooting

### Halaman balik lagi ke login

Kemungkinan cookie token atau role tidak tersimpan. Coba login ulang dan pastikan backend merespons token dengan benar.

### 401 Unauthorized

Token tidak terkirim atau sudah tidak valid. Hapus cookie browser, login ulang, dan pastikan backend berjalan.

### 403 Forbidden

Role user tidak punya akses. Halaman dashboard, product, inventory, dan report hanya untuk manager.

### Data dashboard kosong

Pastikan backend sudah memiliki data transaksi. Jalankan seeder backend atau upload CSV melalui halaman import.

### Export PDF gagal

Pastikan endpoint backend `/reports/export-pdf` bisa diakses oleh user manager dan dependency DomPDF backend sudah terinstall.

---

## Related Repository

- Backend: [`bi-dom-backend`](https://github.com/fredyyfajarr/bi-dom-backend)
