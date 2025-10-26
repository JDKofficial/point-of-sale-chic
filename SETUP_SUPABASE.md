# Setup Supabase untuk POS System

## Langkah 1: Buat Project Supabase

1. Kunjungi [https://supabase.com](https://supabase.com)
2. Buat akun atau login
3. Klik "New Project"
4. Pilih organization dan beri nama project (contoh: "pos-system")
5. Buat password database yang kuat
6. Pilih region terdekat
7. Klik "Create new project"

## Langkah 2: Dapatkan Konfigurasi Project

1. Setelah project dibuat, buka tab "Settings" > "API"
2. Copy nilai berikut:
   - **Project URL** (contoh: https://xxxxx.supabase.co)
   - **anon public key** (key yang panjang dimulai dengan "eyJ...")

## Langkah 3: Konfigurasi Environment Variables

1. Buka file `.env.local` di root project
2. Ganti nilai placeholder dengan konfigurasi Supabase Anda:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Langkah 4: Jalankan Migrasi Database

1. Buka Supabase Dashboard > SQL Editor
2. Jalankan file migrasi secara berurutan dari folder `supabase/migrations/`:
   - `001_create_profiles.sql`
   - `002_create_stores.sql`
   - `003_create_categories.sql`
   - `004_create_products.sql`
   - `005_create_customers.sql`
   - `006_create_transactions.sql`
   - `007_create_transaction_items.sql`
   - `008_setup_storage.sql`
   - `009_create_views_and_functions.sql`

3. Copy dan paste isi setiap file ke SQL Editor, lalu klik "Run"

## Langkah 5: Setup Storage Buckets

Buckets akan dibuat otomatis oleh migrasi `008_setup_storage.sql`, tetapi Anda bisa memverifikasi di:
- Dashboard > Storage
- Pastikan bucket `products`, `stores`, dan `avatars` sudah ada

## Langkah 6: Test Aplikasi

1. Restart development server: `npm run dev`
2. Buka aplikasi di browser
3. Coba register akun baru
4. Login dengan akun yang sudah dibuat

## Troubleshooting

### Error: "Invalid API key"
- Pastikan `VITE_SUPABASE_ANON_KEY` benar
- Pastikan tidak ada spasi di awal/akhir key

### Error: "Failed to fetch"
- Pastikan `VITE_SUPABASE_URL` benar
- Pastikan project Supabase sudah aktif

### Error saat register: "Email not confirmed"
- Cek email untuk link konfirmasi
- Atau disable email confirmation di Authentication > Settings

## Konfigurasi Tambahan (Opsional)

### Disable Email Confirmation (untuk development)
1. Dashboard > Authentication > Settings
2. Scroll ke "User Signups"
3. Uncheck "Enable email confirmations"

### Setup Custom Domain (untuk production)
1. Dashboard > Settings > Custom Domains
2. Ikuti instruksi untuk setup domain kustom

## Keamanan

⚠️ **PENTING**: 
- Jangan commit file `.env.local` ke git
- Gunakan environment variables yang berbeda untuk production
- Aktifkan Row Level Security (RLS) sudah diatur dalam migrasi