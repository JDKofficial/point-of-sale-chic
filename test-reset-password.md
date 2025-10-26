# Test Reset Password Functionality

## Langkah-langkah Testing End-to-End

### 1. Test Forgot Password Form
- [ ] Buka aplikasi di http://localhost:5173
- [ ] Klik "Lupa Password?" di halaman login
- [ ] Masukkan email yang valid dan terdaftar
- [ ] Klik "Kirim Link Reset"
- [ ] Verifikasi toast success muncul
- [ ] Cek email untuk link reset password

### 2. Test Reset Password Link
- [ ] Buka email dan klik link reset password
- [ ] Verifikasi redirect ke halaman reset password
- [ ] Pastikan tidak ada redirect otomatis ke forgot-password
- [ ] Verifikasi form reset password muncul dengan benar

### 3. Test Reset Password Form
- [ ] Masukkan password baru (minimal 6 karakter)
- [ ] Masukkan konfirmasi password yang sama
- [ ] Verifikasi password strength indicator bekerja
- [ ] Verifikasi toggle show/hide password bekerja
- [ ] Klik "Ubah Password"
- [ ] Verifikasi toast success muncul
- [ ] Verifikasi redirect ke halaman login

### 4. Test Login dengan Password Baru
- [ ] Di halaman login, masukkan email dan password baru
- [ ] Verifikasi login berhasil
- [ ] Verifikasi akses ke dashboard

### 5. Test Error Scenarios
- [ ] Test dengan link reset password yang sudah expired
- [ ] Test dengan link reset password yang invalid
- [ ] Test dengan password yang tidak match
- [ ] Test dengan password yang terlalu pendek
- [ ] Verifikasi error messages yang informatif

## Konfigurasi yang Diperlukan

### Supabase Email Template
Template email recovery harus menggunakan format:
```html
<h2>Reset Password</h2>
<p>Follow this link to reset the password for your user:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
```

### Site URL Configuration
- Site URL: http://localhost:5173 (untuk development)
- Redirect URLs: http://localhost:5173/reset-password

### Environment Variables
- VITE_SUPABASE_URL: https://wwylhjkrtlebzfdlpjtg.supabase.co
- VITE_SUPABASE_ANON_KEY: [your-anon-key]

## Hasil Testing
- [ ] Semua test case berhasil
- [ ] Error handling bekerja dengan baik
- [ ] UI/UX responsif dan user-friendly
- [ ] Security measures implemented (auto sign out after reset)