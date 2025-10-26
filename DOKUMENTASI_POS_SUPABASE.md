# 📋 Dokumentasi Aplikasi POS dengan Supabase

## 🎯 Overview
Aplikasi Point of Sale (POS) multi-tenant yang memungkinkan banyak pengguna mengelola toko mereka masing-masing dengan fitur lengkap untuk manajemen produk, pelanggan, dan transaksi.

## 🏗️ Arsitektur Aplikasi

### Tech Stack
- **Frontend**: React + TypeScript + Vite
- **UI Framework**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Database + Auth + Storage)
- **State Management**: React Context
- **Routing**: React Router

### Fitur Utama
1. **Multi-tenant**: Setiap user memiliki toko terpisah
2. **Autentikasi**: Login, Register, Forgot Password
3. **Dashboard**: Laporan ringkas transaksi
4. **Manajemen Produk**: CRUD produk dengan kategori
5. **Manajemen Pelanggan**: CRUD data pelanggan
6. **Riwayat Transaksi**: List transaksi dengan filter tanggal
7. **POS Transaction**: Interface utama untuk penjualan
8. **Profil Toko**: Pengaturan nama, alamat, logo toko

## 🗄️ Skema Database

### 1. Tabel `profiles` (User Profiles)
```sql
- id (uuid, primary key, references auth.users)
- email (text, unique)
- full_name (text)
- avatar_url (text)
- created_at (timestamp)
- updated_at (timestamp)
```

### 2. Tabel `stores` (Informasi Toko)
```sql
- id (uuid, primary key)
- owner_id (uuid, references profiles.id)
- name (text, required)
- address (text)
- phone (text)
- logo_url (text)
- created_at (timestamp)
- updated_at (timestamp)
```

### 3. Tabel `categories` (Kategori Produk)
```sql
- id (uuid, primary key)
- store_id (uuid, references stores.id)
- name (text, required)
- description (text)
- created_at (timestamp)
- updated_at (timestamp)
```

### 4. Tabel `products` (Produk)
```sql
- id (uuid, primary key)
- store_id (uuid, references stores.id)
- category_id (uuid, references categories.id)
- name (text, required)
- description (text)
- price (decimal, required)
- stock (integer, default 0)
- image_url (text)
- sku (text, unique per store)
- is_active (boolean, default true)
- created_at (timestamp)
- updated_at (timestamp)
```

### 5. Tabel `customers` (Pelanggan)
```sql
- id (uuid, primary key)
- store_id (uuid, references stores.id)
- name (text, required)
- email (text)
- phone (text)
- address (text)
- created_at (timestamp)
- updated_at (timestamp)
```

### 6. Tabel `transactions` (Transaksi)
```sql
- id (uuid, primary key)
- store_id (uuid, references stores.id)
- customer_id (uuid, references customers.id, nullable)
- transaction_number (text, unique)
- subtotal (decimal, required)
- discount_amount (decimal, default 0)
- discount_percentage (decimal, default 0)
- tax_amount (decimal, default 0)
- total_amount (decimal, required)
- payment_method (text, default 'cash')
- notes (text)
- created_at (timestamp)
- updated_at (timestamp)
```

### 7. Tabel `transaction_items` (Item Transaksi)
```sql
- id (uuid, primary key)
- transaction_id (uuid, references transactions.id)
- product_id (uuid, references products.id)
- quantity (integer, required)
- unit_price (decimal, required)
- total_price (decimal, required)
- created_at (timestamp)
```

## 🔐 Row Level Security (RLS) Policies

### Prinsip Keamanan
- Setiap user hanya bisa mengakses data toko mereka sendiri
- Semua tabel menggunakan RLS dengan filter berdasarkan `store_id`
- Profile user terhubung dengan `auth.users`

### Policy Examples
```sql
-- Stores: User hanya bisa akses toko mereka
CREATE POLICY "Users can only access their own stores" ON stores
FOR ALL USING (owner_id = auth.uid());

-- Products: User hanya bisa akses produk toko mereka
CREATE POLICY "Users can only access their store products" ON products
FOR ALL USING (store_id IN (
  SELECT id FROM stores WHERE owner_id = auth.uid()
));
```

## 📁 Struktur File

### Database Migrations
```
/supabase/
├── migrations/
│   ├── 001_create_profiles.sql
│   ├── 002_create_stores.sql
│   ├── 003_create_categories.sql
│   ├── 004_create_products.sql
│   ├── 005_create_customers.sql
│   ├── 006_create_transactions.sql
│   ├── 007_create_transaction_items.sql
│   └── 008_setup_rls_policies.sql
└── seed.sql
```

### Frontend Structure
```
/src/
├── components/
│   ├── ui/ (shadcn components)
│   ├── pos/ (POS specific components)
│   └── common/ (shared components)
├── contexts/
│   ├── AuthContext.tsx
│   ├── StoreContext.tsx
│   └── POSContext.tsx
├── hooks/
│   ├── useSupabase.ts
│   ├── useProducts.ts
│   ├── useCustomers.ts
│   └── useTransactions.ts
├── lib/
│   ├── supabase.ts
│   ├── utils.ts
│   └── types.ts
└── pages/ (existing pages)
```

## 🔧 Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🚀 Deployment Steps

### 1. Setup Supabase Project
1. Buat project baru di Supabase
2. Copy URL dan Anon Key
3. Setup environment variables

### 2. Database Migration
1. Jalankan migration files secara berurutan
2. Setup RLS policies
3. Insert seed data (optional)

### 3. Storage Setup
1. Buat bucket untuk product images
2. Buat bucket untuk store logos
3. Setup storage policies

### 4. Frontend Integration
1. Install Supabase client
2. Setup authentication
3. Implement CRUD operations
4. Test all features

## 📊 Fitur Dashboard

### Metrics yang Ditampilkan
- Total penjualan hari ini
- Total transaksi hari ini
- Produk terlaris
- Stok produk menipis
- Grafik penjualan mingguan/bulanan

### Widgets
- Recent transactions
- Low stock alerts
- Top selling products
- Revenue summary

## 🛒 Fitur POS Transaction

### Flow Transaksi
1. Pilih produk dari list/search
2. Input quantity
3. Pilih pelanggan (optional)
4. Apply discount (amount/percentage)
5. Calculate total
6. Process payment
7. Print receipt/save transaction

### Features
- Barcode scanning (future)
- Multiple payment methods
- Discount calculation
- Tax calculation
- Receipt generation

## 🔄 API Endpoints (Supabase Functions)

### Custom Functions
- `get_dashboard_stats(store_id)`
- `get_low_stock_products(store_id, threshold)`
- `generate_transaction_number(store_id)`
- `calculate_transaction_total(items, discount)`

## 📱 Responsive Design
- Desktop-first approach
- Mobile-friendly POS interface
- Tablet optimization for POS transactions
- Touch-friendly buttons and inputs

## 🧪 Testing Strategy
- Unit tests for utility functions
- Integration tests for Supabase operations
- E2E tests for critical user flows
- Manual testing for POS workflows

## 📈 Future Enhancements
- Barcode scanning
- Inventory management
- Multi-location support
- Advanced reporting
- Mobile app
- Offline mode
- Integration with payment gateways