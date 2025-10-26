# Setup EmailJS untuk VibePOS

EmailJS adalah layanan yang memungkinkan pengiriman email langsung dari frontend tanpa perlu backend server.

## 🚀 Langkah-langkah Setup

### 1. Daftar di EmailJS
1. Kunjungi [https://www.emailjs.com/](https://www.emailjs.com/)
2. Klik "Sign Up" dan buat akun gratis
3. Verifikasi email Anda

### 2. Setup Email Service
1. Login ke dashboard EmailJS
2. Klik "Email Services" di sidebar
3. Klik "Add New Service"
4. Pilih **Gmail** (recommended)
5. Ikuti instruksi untuk menghubungkan akun Gmail:
   - Login dengan akun Gmail Anda
   - Berikan izin akses ke EmailJS
6. Catat **Service ID** (contoh: `service_gmail`)

### 3. Buat Email Template
1. Klik "Email Templates" di sidebar
2. Klik "Create New Template"
3. Isi template dengan format berikut:

**Template Name**: `Receipt Template`

**Subject**: `Struk Transaksi #{{transaction_id}} - {{store_name}}`

**Content**:
```html
<h2>{{store_name}}</h2>
<p>Kepada: {{to_name}}</p>
<p>Email: {{to_email}}</p>

<h3>Detail Transaksi</h3>
<p><strong>ID Transaksi:</strong> {{transaction_id}}</p>
<p><strong>Tanggal:</strong> {{transaction_date}}</p>
<p><strong>Metode Pembayaran:</strong> {{payment_method}}</p>

<h3>Items</h3>
<pre>{{items}}</pre>

<h3>Total</h3>
<p><strong>Subtotal:</strong> {{subtotal}}</p>
<p><strong>Pajak:</strong> {{tax}}</p>
<p><strong>Total:</strong> {{total}}</p>

<hr>
<pre>{{receipt_content}}</pre>

<p><em>Terima kasih telah berbelanja!</em></p>
```

4. Klik "Save" dan catat **Template ID** (contoh: `template_receipt`)

### 4. Dapatkan Public Key
1. Klik "Account" di sidebar
2. Scroll ke bagian "API Keys"
3. Catat **Public Key** (contoh: `abc123def456`)

### 5. Update Konfigurasi VibePOS
Edit file `src/lib/emailjs.ts` dan ganti konfigurasi:

```typescript
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_gmail', // Ganti dengan Service ID Anda
  TEMPLATE_ID: 'template_receipt', // Ganti dengan Template ID Anda  
  PUBLIC_KEY: 'abc123def456', // Ganti dengan Public Key Anda
};
```

## ✅ Testing

1. **Test Konfigurasi**:
   - Buka aplikasi VibePOS
   - Masuk ke halaman Transaksi Penjualan
   - Klik tombol "Test Email"
   - Pastikan muncul pesan sukses

2. **Test Pengiriman Email**:
   - Buat transaksi baru
   - Isi email customer dengan email yang valid
   - Centang "Kirim Receipt via Email"
   - Klik "Simpan Transaksi"
   - Cek inbox email customer

## 🔧 Troubleshooting

### ❌ "EmailJS belum dikonfigurasi"
- Pastikan Anda sudah mengganti `YOUR_EMAILJS_PUBLIC_KEY` dengan public key asli
- Restart aplikasi setelah mengubah konfigurasi

### ❌ Email tidak terkirim
- Cek Service ID, Template ID, dan Public Key
- Pastikan email service sudah terverifikasi di dashboard EmailJS
- Cek quota EmailJS (free: 200 email/bulan)

### ❌ "Invalid template ID"
- Pastikan Template ID sesuai dengan dashboard
- Cek apakah template sudah disimpan

### ❌ "Invalid service ID"  
- Pastikan Service ID sesuai dengan email service
- Cek apakah Gmail service sudah aktif

## 💡 Tips

1. **Gunakan Gmail** untuk service yang paling reliable
2. **Test dengan email sendiri** terlebih dahulu
3. **Cek spam folder** jika email tidak masuk ke inbox
4. **Monitor quota** di dashboard EmailJS

## 🔄 Fallback System

Jika EmailJS gagal, aplikasi akan otomatis:
1. Membuka email client default (mailto)
2. Pre-fill subject dan content
3. User tinggal klik "Send"

## 💰 Pricing EmailJS

- **Free**: 200 email/bulan
- **Personal**: $15/bulan untuk 1,000 email
- **Professional**: $35/bulan untuk 5,000 email

## 🌐 Alternatif Lain

Jika EmailJS tidak cocok:
1. **SendGrid** - Powerful API
2. **Mailgun** - Developer-friendly  
3. **AWS SES** - Scalable solution
4. **Nodemailer** - Perlu backend server