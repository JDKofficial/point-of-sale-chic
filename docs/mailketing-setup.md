# Setup Mailketing.co.id untuk Email Service

Panduan lengkap untuk mengatur Mailketing.co.id sebagai primary email service di aplikasi POS.

## 1. Daftar Akun Mailketing

1. Kunjungi [https://mailketing.co.id](https://mailketing.co.id)
2. Daftar akun baru atau login jika sudah punya akun
3. Verifikasi email dan lengkapi profil

## 2. Mendapatkan API Token

1. Login ke dashboard Mailketing
2. Pergi ke menu **API** atau **Settings**
3. Generate API Token baru
4. Salin API Token yang diberikan

## 3. Konfigurasi Environment Variables

Buka file `.env` di root project dan tambahkan/update variabel berikut:

```env
# Mailketing Configuration
VITE_MAILKETING_API_TOKEN=your_api_token_here
VITE_MAILKETING_FROM_NAME=Nama Toko Anda
VITE_MAILKETING_FROM_EMAIL=noreply@tokanda.com
```

### Penjelasan Variabel:
- `VITE_MAILKETING_API_TOKEN`: API token dari dashboard Mailketing
- `VITE_MAILKETING_FROM_NAME`: Nama pengirim yang akan muncul di email
- `VITE_MAILKETING_FROM_EMAIL`: Email pengirim (harus domain yang sudah diverifikasi)

## 4. Verifikasi Domain (Opsional tapi Direkomendasikan)

1. Di dashboard Mailketing, pergi ke menu **Domain**
2. Tambahkan domain email Anda (contoh: tokanda.com)
3. Ikuti instruksi untuk verifikasi DNS
4. Tunggu hingga status domain menjadi "Verified"

## 5. Test Konfigurasi

1. Restart development server: `npm run dev`
2. Buka aplikasi POS
3. Pergi ke **Settings** → **Test Email**
4. Klik **Test Semua Konfigurasi**
5. Pastikan Mailketing menunjukkan status sukses

## 6. Test Pengiriman Email

1. Di dialog Test Email, masukkan email tujuan
2. Klik tombol kirim email
3. Cek inbox email tujuan
4. Verifikasi email receipt diterima dengan benar

## 7. Troubleshooting

### Error: "API Token tidak valid"
- Pastikan API token sudah benar
- Cek apakah token masih aktif di dashboard
- Generate token baru jika diperlukan

### Error: "Domain tidak diverifikasi"
- Verifikasi domain di dashboard Mailketing
- Gunakan email dengan domain yang sudah diverifikasi
- Atau gunakan domain default Mailketing untuk testing

### Error: "Rate limit exceeded"
- Mailketing memiliki limit pengiriman per jam/hari
- Tunggu beberapa saat sebelum mencoba lagi
- Upgrade plan jika diperlukan

### Email tidak diterima
- Cek folder spam/junk
- Pastikan email tujuan valid
- Cek status pengiriman di dashboard Mailketing

## 8. Fitur Mailketing

### Keunggulan:
- ✅ Service lokal Indonesia
- ✅ Support Bahasa Indonesia
- ✅ Harga kompetitif
- ✅ Dashboard yang mudah digunakan
- ✅ API yang sederhana

### Limitasi:
- Tergantung pada plan yang dipilih
- Perlu verifikasi domain untuk deliverability terbaik

## 9. Fallback System

Aplikasi ini menggunakan sistem fallback:
1. **Primary**: Mailketing.co.id
2. **Secondary**: EmailJS
3. **Tertiary**: Supabase Edge Function

Jika Mailketing gagal, sistem akan otomatis mencoba EmailJS, dan jika EmailJS juga gagal, akan menggunakan Supabase Edge Function.

## 10. Monitoring

- Cek dashboard Mailketing untuk statistik pengiriman
- Monitor logs aplikasi untuk error
- Gunakan fitur test email secara berkala

## 11. Pricing

Cek [https://mailketing.co.id/pricing](https://mailketing.co.id/pricing) untuk informasi harga terbaru.

Biasanya tersedia:
- Free tier dengan limit tertentu
- Paid plans dengan limit lebih tinggi
- Enterprise plans untuk volume besar

## 12. Support

Jika mengalami masalah:
1. Cek dokumentasi Mailketing: [https://mailketing.co.id/docs](https://mailketing.co.id/docs)
2. Hubungi support Mailketing
3. Cek issue di repository ini

---

**Catatan**: Pastikan untuk tidak commit API token ke repository. Gunakan file `.env` dan tambahkan `.env` ke `.gitignore`.