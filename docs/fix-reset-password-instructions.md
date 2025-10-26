# Instruksi Perbaikan Reset Password

## Masalah yang Ditemukan

Reset password tidak berfungsi karena:
1. Template email menggunakan `{{ .ConfirmationURL }}` yang tidak kompatibel dengan `redirectTo` parameter
2. URL yang dihasilkan tidak mengandung `token_hash` dan `type` parameter yang diperlukan

## Solusi

### 1. Update Template Email di Supabase Dashboard

1. Buka Supabase Dashboard → Authentication → Email Templates
2. Pilih "Reset Password" template
3. Ganti template HTML dengan konten dari file: `docs/correct-reset-password-template.html`

**Poin Penting:**
- Template baru menggunakan `{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=recovery`
- Ini akan menghasilkan URL yang benar dengan parameter yang diperlukan

### 2. Verifikasi Site URL dan Redirect URLs

1. Buka Supabase Dashboard → Authentication → URL Configuration
2. Pastikan:
   - **Site URL**: `http://localhost:8081`
   - **Redirect URLs**: `http://localhost:8081/**` (dengan wildcard)

### 3. Komponen ResetPassword Sudah Diupdate

Komponen `ResetPassword.tsx` sudah diupdate untuk menangani:
- Format baru: `?token_hash=xxx&type=recovery` (dari template yang diperbaiki)
- Format lama: `#access_token=xxx&refresh_token=xxx&type=recovery` (fallback)

## Cara Testing Setelah Perbaikan

1. Buka aplikasi di `http://localhost:8081`
2. Klik "Lupa Password"
3. Masukkan email yang terdaftar
4. Cek email yang diterima
5. Klik link di email
6. Seharusnya redirect ke `http://localhost:8081/reset-password?token_hash=xxx&type=recovery`
7. Form reset password akan muncul
8. Masukkan password baru dan submit

## Debugging

Jika masih ada masalah, cek console browser untuk log debug:
```
=== RESET PASSWORD DEBUG ===
Full URL: http://localhost:8081/reset-password?token_hash=xxx&type=recovery
Hash: 
Search: ?token_hash=xxx&type=recovery
Query params: token_hash=xxx&type=recovery
Token Hash: Present
Type: recovery
==============================
Using new token_hash format
```

## File yang Diubah

1. `src/pages/ResetPassword.tsx` - Updated untuk handle format baru
2. `docs/correct-reset-password-template.html` - Template email yang benar
3. Template email di Supabase Dashboard (perlu diupdate manual)

## Catatan Teknis

- Supabase menggunakan `{{ .RedirectTo }}` ketika `redirectTo` parameter digunakan
- `{{ .ConfirmationURL }}` hanya untuk flow default tanpa custom redirect
- `verifyOtp()` dengan `token_hash` adalah cara yang benar untuk recovery tokens