# Database Design - VibePOS

## Overview
VibePOS menggunakan PostgreSQL database melalui Supabase dengan Row Level Security (RLS) untuk keamanan data.

## Database Schema

### 1. Profiles Table
Menyimpan informasi profil pengguna yang terhubung dengan Supabase Auth.

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Columns:**
- `id` (UUID, PK): Foreign key ke auth.users
- `full_name` (TEXT): Nama lengkap pengguna
- `phone` (TEXT): Nomor telepon
- `avatar_url` (TEXT): URL foto profil
- `created_at` (TIMESTAMPTZ): Waktu pembuatan
- `updated_at` (TIMESTAMPTZ): Waktu update terakhir

### 2. Stores Table
Menyimpan informasi toko/outlet.

```sql
CREATE TABLE stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  logo_url TEXT,
  owner_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Columns:**
- `id` (UUID, PK): ID unik toko
- `name` (TEXT, NOT NULL): Nama toko
- `address` (TEXT): Alamat toko
- `phone` (TEXT): Nomor telepon toko
- `logo_url` (TEXT): URL logo toko
- `owner_id` (UUID, FK): ID pemilik toko
- `created_at` (TIMESTAMPTZ): Waktu pembuatan
- `updated_at` (TIMESTAMPTZ): Waktu update terakhir

### 3. Categories Table
Menyimpan kategori produk per toko.

```sql
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Columns:**
- `id` (UUID, PK): ID unik kategori
- `name` (TEXT, NOT NULL): Nama kategori
- `description` (TEXT): Deskripsi kategori
- `store_id` (UUID, FK): ID toko pemilik
- `created_at` (TIMESTAMPTZ): Waktu pembuatan
- `updated_at` (TIMESTAMPTZ): Waktu update terakhir

### 4. Products Table
Menyimpan informasi produk.

```sql
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  category_id UUID REFERENCES categories(id),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Columns:**
- `id` (UUID, PK): ID unik produk
- `name` (TEXT, NOT NULL): Nama produk
- `description` (TEXT): Deskripsi produk
- `price` (DECIMAL): Harga produk
- `stock` (INTEGER): Jumlah stok
- `image_url` (TEXT): URL gambar produk
- `category_id` (UUID, FK): ID kategori
- `store_id` (UUID, FK): ID toko pemilik
- `is_active` (BOOLEAN): Status aktif produk
- `created_at` (TIMESTAMPTZ): Waktu pembuatan
- `updated_at` (TIMESTAMPTZ): Waktu update terakhir

### 5. Customers Table
Menyimpan informasi pelanggan per toko.

```sql
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Columns:**
- `id` (UUID, PK): ID unik pelanggan
- `name` (TEXT, NOT NULL): Nama pelanggan
- `email` (TEXT): Email pelanggan
- `phone` (TEXT): Nomor telepon
- `address` (TEXT): Alamat pelanggan
- `store_id` (UUID, FK): ID toko
- `created_at` (TIMESTAMPTZ): Waktu pembuatan
- `updated_at` (TIMESTAMPTZ): Waktu update terakhir

### 6. Transactions Table
Menyimpan header transaksi penjualan.

```sql
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'transfer')),
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  cashier_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Columns:**
- `id` (UUID, PK): ID unik transaksi
- `transaction_number` (TEXT, UNIQUE): Nomor transaksi
- `customer_id` (UUID, FK): ID pelanggan
- `total_amount` (DECIMAL): Total amount transaksi
- `payment_method` (TEXT): Metode pembayaran
- `status` (TEXT): Status transaksi
- `store_id` (UUID, FK): ID toko
- `cashier_id` (UUID, FK): ID kasir
- `created_at` (TIMESTAMPTZ): Waktu pembuatan
- `updated_at` (TIMESTAMPTZ): Waktu update terakhir

### 7. Transaction Items Table
Menyimpan detail item dalam transaksi.

```sql
CREATE TABLE transaction_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Columns:**
- `id` (UUID, PK): ID unik item transaksi
- `transaction_id` (UUID, FK): ID transaksi
- `product_id` (UUID, FK): ID produk
- `quantity` (INTEGER): Jumlah item
- `price` (DECIMAL): Harga per item
- `subtotal` (DECIMAL): Subtotal (quantity × price)
- `created_at` (TIMESTAMPTZ): Waktu pembuatan

## Database Relationships

### Entity Relationship Diagram (ERD)

```
profiles (1) -----> (n) stores
stores (1) -----> (n) categories
stores (1) -----> (n) products
stores (1) -----> (n) customers
stores (1) -----> (n) transactions
categories (1) -----> (n) products
customers (1) -----> (n) transactions
transactions (1) -----> (n) transaction_items
products (1) -----> (n) transaction_items
profiles (1) -----> (n) transactions (as cashier)
```

## Indexes

### Performance Indexes
```sql
-- Indexes untuk performa query
CREATE INDEX idx_products_store_id ON products(store_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_customers_store_id ON customers(store_id);
CREATE INDEX idx_transactions_store_id ON transactions(store_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transaction_items_transaction_id ON transaction_items(transaction_id);
CREATE INDEX idx_transaction_items_product_id ON transaction_items(product_id);
```

## Row Level Security (RLS)

### Profiles RLS
```sql
-- Users can only see and edit their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### Stores RLS
```sql
-- Users can only access stores they own
CREATE POLICY "Users can view own stores" ON stores
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own stores" ON stores
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own stores" ON stores
  FOR UPDATE USING (auth.uid() = owner_id);
```

### Products RLS
```sql
-- Users can only access products from their stores
CREATE POLICY "Users can view products from own stores" ON products
  FOR SELECT USING (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage products in own stores" ON products
  FOR ALL USING (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );
```

## Views

### Products with Category View
```sql
CREATE VIEW products_with_category AS
SELECT 
  p.*,
  c.name as category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id;
```

### Transaction Summary View
```sql
CREATE VIEW transaction_summary AS
SELECT 
  t.*,
  c.name as customer_name,
  p.full_name as cashier_name,
  COUNT(ti.id) as item_count
FROM transactions t
LEFT JOIN customers c ON t.customer_id = c.id
LEFT JOIN profiles p ON t.cashier_id = p.id
LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
GROUP BY t.id, c.name, p.full_name;
```

## Functions

### Generate Transaction Number
```sql
CREATE OR REPLACE FUNCTION generate_transaction_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
BEGIN
  new_number := 'TRX-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                LPAD(NEXTVAL('transaction_number_seq')::TEXT, 4, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;
```

### Update Product Stock
```sql
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE products 
    SET stock = stock - NEW.quantity 
    WHERE id = NEW.product_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE products 
    SET stock = stock + OLD.quantity 
    WHERE id = OLD.product_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

## Triggers

### Auto Update Timestamps
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stores_updated_at 
  BEFORE UPDATE ON stores 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Stock Management Trigger
```sql
CREATE TRIGGER trigger_update_product_stock
  AFTER INSERT OR DELETE ON transaction_items
  FOR EACH ROW EXECUTE FUNCTION update_product_stock();
```

## Storage Buckets

### Product Images
```sql
-- Bucket untuk gambar produk
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true);
```

### Store Logos
```sql
-- Bucket untuk logo toko
INSERT INTO storage.buckets (id, name, public) 
VALUES ('store-logos', 'store-logos', true);
```

### User Avatars
```sql
-- Bucket untuk avatar pengguna
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true);
```

## Migration Strategy

1. **001_create_profiles.sql** - Membuat tabel profiles
2. **002_create_stores.sql** - Membuat tabel stores
3. **003_create_categories.sql** - Membuat tabel categories
4. **004_create_products.sql** - Membuat tabel products
5. **005_create_customers.sql** - Membuat tabel customers
6. **006_create_transactions.sql** - Membuat tabel transactions
7. **007_create_transaction_items.sql** - Membuat tabel transaction_items
8. **008_setup_storage.sql** - Setup storage buckets
9. **009_create_views_and_functions.sql** - Membuat views dan functions

## Backup Strategy

- **Daily automated backups** melalui Supabase
- **Point-in-time recovery** tersedia hingga 7 hari
- **Manual backup** sebelum migration besar