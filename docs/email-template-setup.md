# Email Template Setup - VibePOS

## Overview
VibePOS menggunakan Supabase Auth untuk mengirim email otomatis seperti konfirmasi registrasi, reset password, dan notifikasi lainnya. Dokumen ini menjelaskan cara mengkonfigurasi email templates.

## Supabase Email Configuration

### 1. SMTP Settings
Konfigurasi SMTP di Supabase Dashboard:

1. Buka **Supabase Dashboard** → **Authentication** → **Settings**
2. Scroll ke bagian **SMTP Settings**
3. Isi konfigurasi berikut:

```
SMTP Host: smtp.gmail.com (atau provider lain)
SMTP Port: 587
SMTP User: your-email@gmail.com
SMTP Pass: your-app-password
Sender Name: VibePOS
Sender Email: noreply@vibepos.com
```

### 2. Email Templates

#### Confirm Signup Template
**Subject:** `Konfirmasi Akun VibePOS Anda`

**Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Konfirmasi Akun VibePOS</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #6366f1; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Selamat Datang di VibePOS!</h1>
        </div>
        <div class="content">
            <h2>Halo!</h2>
            <p>Terima kasih telah mendaftar di VibePOS. Untuk mengaktifkan akun Anda, silakan klik tombol konfirmasi di bawah ini:</p>
            
            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">Konfirmasi Akun</a>
            </div>
            
            <p>Atau copy dan paste link berikut di browser Anda:</p>
            <p style="word-break: break-all; background: #eee; padding: 10px;">{{ .ConfirmationURL }}</p>
            
            <p><strong>Link ini akan kedaluwarsa dalam 24 jam.</strong></p>
            
            <p>Jika Anda tidak mendaftar di VibePOS, abaikan email ini.</p>
        </div>
        <div class="footer">
            <p>© 2024 VibePOS. Semua hak dilindungi.</p>
            <p>Email ini dikirim otomatis, mohon jangan membalas.</p>
        </div>
    </div>
</body>
</html>
```

#### Reset Password Template
**Subject:** `Reset Password VibePOS`

**Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password VibePOS</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .warning { background: #fef3cd; border: 1px solid #fecaca; padding: 15px; border-radius: 5px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Reset Password VibePOS</h1>
        </div>
        <div class="content">
            <h2>Permintaan Reset Password</h2>
            <p>Kami menerima permintaan untuk mereset password akun VibePOS Anda.</p>
            
            <div class="warning">
                <strong>⚠️ Penting:</strong> Jika Anda tidak meminta reset password, abaikan email ini dan password Anda akan tetap aman.
            </div>
            
            <p>Untuk membuat password baru, klik tombol di bawah ini:</p>
            
            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">Reset Password</a>
            </div>
            
            <p>Atau copy dan paste link berikut di browser Anda:</p>
            <p style="word-break: break-all; background: #eee; padding: 10px;">{{ .ConfirmationURL }}</p>
            
            <p><strong>Link ini akan kedaluwarsa dalam 1 jam.</strong></p>
            
            <h3>Tips Keamanan:</h3>
            <ul>
                <li>Gunakan password yang kuat (minimal 8 karakter)</li>
                <li>Kombinasikan huruf besar, kecil, angka, dan simbol</li>
                <li>Jangan gunakan password yang sama dengan akun lain</li>
            </ul>
        </div>
        <div class="footer">
            <p>© 2024 VibePOS. Semua hak dilindungi.</p>
            <p>Email ini dikirim otomatis, mohon jangan membalas.</p>
        </div>
    </div>
</body>
</html>
```

#### Magic Link Template
**Subject:** `Login ke VibePOS Anda`

**Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Magic Link VibePOS</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✨ Magic Link VibePOS</h1>
        </div>
        <div class="content">
            <h2>Login Tanpa Password</h2>
            <p>Klik tombol di bawah ini untuk login ke akun VibePOS Anda tanpa perlu memasukkan password:</p>
            
            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">Login Sekarang</a>
            </div>
            
            <p>Atau copy dan paste link berikut di browser Anda:</p>
            <p style="word-break: break-all; background: #eee; padding: 10px;">{{ .ConfirmationURL }}</p>
            
            <p><strong>Link ini akan kedaluwarsa dalam 5 menit.</strong></p>
            
            <p>Jika Anda tidak meminta login link ini, abaikan email ini.</p>
        </div>
        <div class="footer">
            <p>© 2024 VibePOS. Semua hak dilindungi.</p>
            <p>Email ini dikirim otomatis, mohon jangan membalas.</p>
        </div>
    </div>
</body>
</html>
```

## Custom Email Templates

### 1. Transaction Receipt Email
Untuk mengirim struk transaksi via email:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Struk Transaksi - VibePOS</title>
    <style>
        body { font-family: 'Courier New', monospace; max-width: 400px; margin: 0 auto; }
        .receipt { border: 2px dashed #333; padding: 20px; }
        .header { text-align: center; border-bottom: 1px solid #333; padding-bottom: 10px; }
        .item { display: flex; justify-content: space-between; margin: 5px 0; }
        .total { border-top: 1px solid #333; padding-top: 10px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="header">
            <h2>{{ .StoreName }}</h2>
            <p>{{ .StoreAddress }}</p>
            <p>Tel: {{ .StorePhone }}</p>
            <hr>
            <p>No: {{ .TransactionNumber }}</p>
            <p>{{ .Date }} {{ .Time }}</p>
            <p>Kasir: {{ .CashierName }}</p>
        </div>
        
        <div class="items">
            <hr>
            {{range .Items}}
            <div class="item">
                <span>{{ .Name }}</span>
                <span>{{ .Quantity }}x{{ .Price }}</span>
                <span>{{ .Subtotal }}</span>
            </div>
            {{end}}
        </div>
        
        <div class="total">
            <hr>
            <div class="item">
                <span>TOTAL:</span>
                <span>Rp {{ .TotalAmount }}</span>
            </div>
            <div class="item">
                <span>Bayar ({{ .PaymentMethod }}):</span>
                <span>Rp {{ .PaidAmount }}</span>
            </div>
            <div class="item">
                <span>Kembali:</span>
                <span>Rp {{ .ChangeAmount }}</span>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
            <p>Terima kasih atas kunjungan Anda!</p>
            <p>{{ .FooterMessage }}</p>
        </div>
    </div>
</body>
</html>
```

### 2. Low Stock Alert Email
Untuk notifikasi stok menipis:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Peringatan Stok Menipis - VibePOS</title>
    <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; }
        .alert { background: #fef3cd; border: 1px solid #fecaca; padding: 15px; border-radius: 5px; }
        .product { background: white; margin: 10px 0; padding: 15px; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="alert">
            <h2>⚠️ Peringatan Stok Menipis</h2>
            <p>Beberapa produk di toko <strong>{{ .StoreName }}</strong> memiliki stok yang menipis:</p>
        </div>
        
        {{range .LowStockProducts}}
        <div class="product">
            <h3>{{ .Name }}</h3>
            <p>Kategori: {{ .Category }}</p>
            <p>Stok tersisa: <strong style="color: red;">{{ .Stock }} unit</strong></p>
            <p>Minimum stok: {{ .MinStock }} unit</p>
        </div>
        {{end}}
        
        <p>Silakan segera lakukan restocking untuk produk-produk tersebut.</p>
    </div>
</body>
</html>
```

## Email Configuration in Code

### 1. Setup Email Service
```typescript
// lib/emailService.ts
import { supabase } from './supabase'

export const emailService = {
  async sendTransactionReceipt(transactionId: string, customerEmail: string) {
    // Get transaction data
    const { data: transaction } = await supabase
      .from('transactions')
      .select(`
        *,
        customers(*),
        stores(*),
        transaction_items(*, products(*))
      `)
      .eq('id', transactionId)
      .single()

    // Send email via Edge Function
    const { error } = await supabase.functions.invoke('send-receipt-email', {
      body: {
        to: customerEmail,
        transaction: transaction
      }
    })

    if (error) throw error
  },

  async sendLowStockAlert(storeId: string) {
    // Get low stock products
    const { data: products } = await supabase
      .from('products')
      .select('*, categories(*)')
      .eq('store_id', storeId)
      .lt('stock', 10)

    if (products && products.length > 0) {
      const { error } = await supabase.functions.invoke('send-low-stock-alert', {
        body: {
          storeId,
          products
        }
      })

      if (error) throw error
    }
  }
}
```

### 2. Edge Function for Sending Emails
```typescript
// supabase/functions/send-receipt-email/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  try {
    const { to, transaction } = await req.json()

    // Render email template
    const emailHtml = renderReceiptTemplate(transaction)

    // Send email using your preferred service (SendGrid, Resend, etc.)
    const response = await fetch('https://api.sendgrid.v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: to }],
          subject: `Struk Transaksi ${transaction.transaction_number}`
        }],
        from: { email: 'noreply@vibepos.com', name: 'VibePOS' },
        content: [{
          type: 'text/html',
          value: emailHtml
        }]
      })
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
```

## Testing Email Templates

### 1. Test Environment
```bash
# Install Supabase CLI
npm install -g supabase

# Start local development
supabase start

# Test email templates
supabase functions serve --env-file .env.local
```

### 2. Email Testing Tools
- **Mailtrap**: Untuk testing di development
- **SendGrid**: Untuk production
- **Resend**: Alternative modern email service

## Environment Variables

```env
# Email Service Configuration
SENDGRID_API_KEY=your_sendgrid_api_key
RESEND_API_KEY=your_resend_api_key

# Email Settings
FROM_EMAIL=noreply@vibepos.com
FROM_NAME=VibePOS
REPLY_TO_EMAIL=support@vibepos.com

# Template Settings
LOGO_URL=https://your-domain.com/logo.png
COMPANY_ADDRESS=Jl. Contoh No. 123, Jakarta
SUPPORT_URL=https://vibepos.com/support
```

## Best Practices

1. **Responsive Design**: Pastikan email tampil baik di mobile dan desktop
2. **Fallback Text**: Sediakan versi text untuk email HTML
3. **Unsubscribe Link**: Tambahkan link unsubscribe untuk email marketing
4. **Testing**: Test email di berbagai email client
5. **Deliverability**: Monitor bounce rate dan spam score
6. **Personalization**: Gunakan data user untuk personalisasi
7. **Security**: Jangan kirim informasi sensitif via email

## Troubleshooting

### Common Issues:
1. **Email tidak terkirim**: Cek SMTP configuration
2. **Email masuk spam**: Improve email content dan setup SPF/DKIM
3. **Template tidak render**: Validate HTML dan CSS
4. **Rate limiting**: Implement email queue system