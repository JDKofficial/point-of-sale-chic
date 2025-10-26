# 🔐 Mailketing Reset Password - Panduan Lengkap

Implementasi reset password menggunakan Mailketing sebagai alternatif dari Supabase email default.

## 📋 Fitur Utama

### ✅ Yang Sudah Diimplementasi
- ✅ Template email kustom dengan desain modern
- ✅ Sistem token keamanan dengan expiry 1 jam
- ✅ Halaman reset password khusus Mailketing
- ✅ Integrasi dengan halaman Forgot Password
- ✅ Validasi token dan email
- ✅ UI/UX yang user-friendly
- ✅ Error handling yang komprehensif

### 🔧 Komponen yang Dibuat

#### 1. **MailketingResetPasswordService** (`src/lib/mailketing-reset-password.ts`)
- Service utama untuk mengelola reset password via Mailketing
- Generate token keamanan kustom
- Template email HTML yang responsif
- Validasi dan pembersihan token

#### 2. **ResetPasswordMailketing** (`src/pages/ResetPasswordMailketing.tsx`)
- Halaman khusus untuk reset password via Mailketing
- Validasi token real-time
- Form password baru dengan konfirmasi
- UI yang konsisten dengan aplikasi

#### 3. **ForgotPassword Enhanced** (`src/pages/ForgotPassword.tsx`)
- Pilihan metode email (Supabase vs Mailketing)
- UI radio button untuk pemilihan
- Loading state terpisah untuk setiap metode
- Info box untuk penjelasan fitur

## 🚀 Cara Penggunaan

### 1. Setup Environment Variables
Pastikan variabel berikut sudah dikonfigurasi di `.env`:

```env
# Mailketing Configuration
VITE_MAILKETING_API_TOKEN=your_api_token_here
VITE_MAILKETING_FROM_NAME=VibePOS
VITE_MAILKETING_FROM_EMAIL=noreply@yourdomain.com
```

### 2. Flow Reset Password Mailketing

#### Step 1: User Request Reset
1. User buka halaman `/forgot-password`
2. Pilih "Mailketing (Rekomendasi)"
3. Masukkan email dan klik "Kirim Link Reset (Mailketing)"

#### Step 2: Email Dikirim
1. System generate token keamanan unik
2. Email HTML dikirim via Mailketing API
3. User menerima email dengan link reset

#### Step 3: Reset Password
1. User klik link di email → redirect ke `/reset-password-mailketing`
2. System validasi token dan email
3. User input password baru
4. Password berhasil diubah

### 3. URL Format
```
http://localhost:8081/reset-password-mailketing?token=ABC123_1234567890_xyz&email=user@example.com
```

## 🔒 Keamanan

### Token Security
- **Format**: `{emailHash}_{timestamp}_{random}`
- **Expiry**: 1 jam dari waktu generate
- **Storage**: localStorage (temporary, production gunakan database)
- **Validation**: Email + token + timestamp check

### Email Template Security
- Link dengan parameter terenkripsi
- Warning untuk link yang expired
- Tips keamanan password
- Branding yang konsisten

## 🎨 Template Email

### Fitur Template
- **Responsive Design**: Mobile-friendly
- **Modern UI**: Gradient, shadows, hover effects
- **Security Warnings**: Jelas dan informatif
- **Branding**: Logo dan warna VibePOS
- **Tips Keamanan**: Panduan password yang aman

### Struktur Email
1. **Header**: Logo dan judul
2. **Content**: Pesan personal dan instruksi
3. **CTA Button**: Tombol reset yang prominent
4. **URL Fallback**: Link manual jika button tidak work
5. **Security Tips**: Panduan keamanan
6. **Footer**: Branding dan disclaimer

## 🧪 Testing

### Manual Testing Steps

#### 1. Test Mailketing Configuration
```bash
# Buka aplikasi
npm run dev

# Test di browser
http://localhost:8081/forgot-password
```

#### 2. Test Reset Flow
1. **Input Email**: Masukkan email valid
2. **Pilih Mailketing**: Radio button "Mailketing (Rekomendasi)"
3. **Kirim Email**: Klik tombol kirim
4. **Check Email**: Buka inbox dan cari email dari Mailketing
5. **Klik Link**: Klik tombol "Reset Password Sekarang"
6. **Input Password**: Masukkan password baru
7. **Konfirmasi**: Pastikan redirect ke login

#### 3. Test Error Cases
- ❌ Email tidak valid
- ❌ Token expired (> 1 jam)
- ❌ Token tidak ditemukan
- ❌ Password tidak match
- ❌ Mailketing API error

### Expected Results
- ✅ Email terkirim dalam < 5 detik
- ✅ Template email tampil dengan benar
- ✅ Link redirect ke halaman reset yang benar
- ✅ Token validation berfungsi
- ✅ Password berhasil diubah
- ✅ Redirect ke login setelah sukses

## 🔧 Troubleshooting

### Common Issues

#### 1. Email Tidak Terkirim
**Symptoms**: Loading terus, error message
**Solutions**:
- Check environment variables
- Verify Mailketing API token
- Check network connection
- Verify domain di Mailketing dashboard

#### 2. Token Invalid
**Symptoms**: "Link tidak valid" di halaman reset
**Solutions**:
- Check URL parameters
- Verify token belum expired
- Clear localStorage dan coba lagi
- Generate token baru

#### 3. Password Update Gagal
**Symptoms**: Error saat submit password baru
**Solutions**:
- Check Supabase connection
- Verify user authentication
- Check password requirements
- Review console logs

### Debug Mode
Enable debug dengan menambahkan di console:
```javascript
localStorage.setItem('debug_mailketing', 'true');
```

## 📊 Monitoring

### Metrics to Track
- **Email Delivery Rate**: Berapa % email terkirim
- **Link Click Rate**: Berapa % user klik link
- **Reset Success Rate**: Berapa % berhasil reset
- **Token Expiry Rate**: Berapa % token expired

### Logs to Monitor
- Email send attempts
- Token generation
- Token validation
- Password update success/failure

## 🔄 Future Improvements

### Phase 2 Enhancements
- [ ] Database storage untuk tokens (replace localStorage)
- [ ] Email template customization via admin panel
- [ ] Multiple email providers fallback
- [ ] Analytics dashboard untuk reset password
- [ ] Rate limiting untuk prevent abuse
- [ ] SMS backup untuk reset password

### Integration Ideas
- [ ] WhatsApp reset password notification
- [ ] Push notification untuk mobile app
- [ ] Social login integration
- [ ] Two-factor authentication

## 📝 Code Examples

### Custom Token Generation
```typescript
const generateCustomToken = (email: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const emailHash = btoa(email).substring(0, 8);
  return `${emailHash}_${timestamp}_${random}`;
};
```

### Email Template Usage
```typescript
const emailContent = createResetPasswordEmailHTML({
  email: 'user@example.com',
  resetUrl: 'http://localhost:8081/reset-password-mailketing?token=...',
  userName: 'John Doe'
});
```

### Token Validation
```typescript
const isValid = mailketingResetPasswordService.verifyResetToken(email, token);
if (!isValid) {
  // Handle invalid token
}
```

## 🎯 Best Practices

### Security
- Always validate tokens server-side
- Use HTTPS in production
- Implement rate limiting
- Log security events
- Clear tokens after use

### UX
- Clear error messages
- Loading states
- Progress indicators
- Mobile-responsive design
- Accessibility compliance

### Performance
- Optimize email template size
- Cache email configurations
- Async email sending
- Error retry mechanisms
- Monitor API response times

---

## 📞 Support

Jika ada masalah dengan implementasi Mailketing reset password:

1. **Check Documentation**: Baca panduan ini lengkap
2. **Check Logs**: Review console dan network logs
3. **Test Configuration**: Gunakan email test dialog
4. **Contact Support**: Hubungi tim development

**Created**: 2024
**Last Updated**: 2024
**Version**: 1.0.0