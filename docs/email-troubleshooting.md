# Email Troubleshooting Guide

## Masalah yang Ditemukan

Berdasarkan analisis error console, masalah email terjadi karena:

1. **Edge Function belum di-deploy** ✅ FIXED
   - Error: `net::ERR_FAILED https://wwylhjkrtlebzfdlpjtg.supabase.co/functions/v1/send-receipt-email`
   - **Solusi**: Edge Function sudah berhasil di-deploy

2. **RESEND_API_KEY belum dikonfigurasi** ⚠️ PERLU DIKONFIGURASI
   - Error: `RESEND_API_KEY not configured`
   - **Solusi**: Perlu mengatur environment variable di Supabase

## Langkah-langkah Perbaikan

### 1. Mendapatkan Resend API Key

1. Kunjungi [https://resend.com](https://resend.com)
2. Daftar atau login ke akun Anda
3. Pergi ke [API Keys](https://resend.com/api-keys)
4. Buat API key baru
5. Salin API key tersebut

### 2. Mengatur Environment Variable di Supabase

**Opsi A: Melalui Dashboard Supabase**
1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Pergi ke **Settings** > **Edge Functions**
4. Scroll ke bagian **Environment Variables**
5. Tambahkan:
   - **Key**: `RESEND_API_KEY`
   - **Value**: API key yang Anda dapatkan dari Resend
6. Klik **Save**

**Opsi B: Melalui CLI (jika terinstall)**
```bash
# Install Supabase CLI jika belum ada
npm install -g supabase

# Set secret
supabase secrets set RESEND_API_KEY=your_actual_api_key_here
```

### 3. Verifikasi Domain Email (Opsional tapi Direkomendasikan)

Untuk production, sebaiknya verifikasi domain Anda di Resend:

1. Di dashboard Resend, pergi ke **Domains**
2. Tambahkan domain Anda
3. Ikuti instruksi untuk verifikasi DNS
4. Update Edge Function untuk menggunakan domain yang sudah diverifikasi

### 4. Update Edge Function (jika perlu)

Jika Anda memiliki domain yang sudah diverifikasi, update file `supabase/functions/send-receipt-email/index.ts`:

```typescript
const emailPayload = {
  from: 'noreply@yourdomain.com', // Ganti dengan domain yang sudah diverifikasi
  to: transactionData.customer_email,
  subject: `Struk Transaksi ${transactionData.transaction_number} - ${transactionData.store_name}`,
  html: emailHTML,
};
```

Kemudian deploy ulang:
```bash
supabase functions deploy send-receipt-email
```

## Testing

Setelah mengatur RESEND_API_KEY:

1. Buka aplikasi POS
2. Pilih customer yang memiliki email
3. Tambahkan produk ke keranjang
4. Centang checkbox "Kirim via Email"
5. Lakukan checkout
6. Periksa apakah email terkirim tanpa error

## Troubleshooting Tambahan

### Error: "Failed to send email"
- Pastikan API key valid dan aktif
- Periksa quota Resend Anda
- Pastikan email customer valid

### Error: "Domain not verified"
- Gunakan domain yang sudah diverifikasi di Resend
- Atau gunakan email testing Resend untuk development

### Error: "Rate limit exceeded"
- Resend memiliki rate limit
- Tunggu beberapa saat sebelum mencoba lagi
- Upgrade plan Resend jika perlu

## Status Saat Ini

✅ Edge Function berhasil di-deploy
⚠️ RESEND_API_KEY perlu dikonfigurasi di Supabase Dashboard
⏳ Testing menunggu konfigurasi API key

## File yang Terlibat

- `supabase/functions/send-receipt-email/index.ts` - Edge Function
- `src/lib/email.ts` - Email service frontend
- `src/pages/TransaksiJualan.tsx` - UI integration
- `.env` - Local environment variables
- `supabase/.env.production` - Production secrets template