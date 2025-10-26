# 📱 WhatsApp Receipt Feature - Setup & Configuration

## 🎯 Overview
Fitur WhatsApp Receipt memungkinkan toko untuk mengirim struk digital secara otomatis kepada pelanggan melalui WhatsApp setelah transaksi selesai. Fitur ini mendukung 3 platform WhatsApp API: WAHA, DripSender, dan StarSender.

## ✨ Features
- ✅ Kirim struk digital otomatis via WhatsApp
- ✅ Template struk yang menarik dengan emoji dan format profesional
- ✅ Dukungan multi-platform (WAHA, DripSender, StarSender)
- ✅ Validasi nomor WhatsApp Indonesia
- ✅ UI yang user-friendly dengan indikator status
- ✅ Error handling dan notifikasi toast

## 🏗️ Architecture

### Files Structure
```
src/
├── lib/
│   ├── whatsapp.ts           # Core WhatsApp service
│   └── whatsapp-config.ts    # Configuration utilities
└── pages/
    └── TransaksiJualan.tsx   # Transaction page with WhatsApp integration
```

### Environment Variables
```env
# WhatsApp Configuration
VITE_WHATSAPP_PLATFORM=waha              # Platform: waha, dripsender, starsender
VITE_WHATSAPP_API_URL=http://localhost:3000
VITE_WHATSAPP_API_KEY=your_api_key_here
VITE_WHATSAPP_SESSION_ID=default
VITE_WHATSAPP_DEVICE_ID=your_device_id_here
```

## 🚀 Platform Setup

### 1. WAHA (Recommended)
**Pros:** Free, open-source, self-hosted
**Best for:** Transactional receipts

```bash
# Install WAHA
docker run -it --rm -p 3000:3000/tcp devlikeapro/waha

# Configuration
VITE_WHATSAPP_PLATFORM=waha
VITE_WHATSAPP_API_URL=http://localhost:3000
VITE_WHATSAPP_SESSION_ID=default
```

### 2. DripSender
**Pros:** Reliable, good support
**Best for:** Backup solution

```env
VITE_WHATSAPP_PLATFORM=dripsender
VITE_WHATSAPP_API_URL=https://api.dripsender.id
VITE_WHATSAPP_API_KEY=your_dripsender_api_key
VITE_WHATSAPP_DEVICE_ID=your_device_id
```

### 3. StarSender
**Pros:** Feature-rich, marketing tools, reliable API
**Best for:** Production environments, marketing campaigns

```env
VITE_WHATSAPP_PLATFORM=starsender
VITE_WHATSAPP_API_URL=https://api.starsender.online/api
VITE_WHATSAPP_API_KEY=your_starsender_api_key
VITE_WHATSAPP_SESSION_ID=your_session_id_here
```

**StarSender API Format:**
- Endpoint: `https://api.starsender.online/api/send`
- Method: POST
- Headers: `Authorization: YOUR_API_KEY` (tanpa Bearer prefix)
- Payload:
  ```json
  {
    "messageType": "text",
    "to": "08123456789",
    "body": "Your Message",
    "delay": 0
  }
  ```

## 📋 Implementation Details

### WhatsApp Service (`whatsapp.ts`)
```typescript
// Core features:
- formatPhoneNumber()     // Format to Indonesian standard
- generateReceiptMessage() // Create beautiful receipt template
- sendMessage()           // Send via selected platform
- sendReceipt()          // Send transaction receipt
- validateWhatsAppNumber() // Validate phone number
```

### Transaction Integration
1. **Customer Selection**: Pilih pelanggan dengan nomor WhatsApp
2. **WhatsApp Option**: Checkbox untuk mengaktifkan pengiriman
3. **Status Indicator**: Visual feedback sebelum checkout
4. **Auto Send**: Kirim otomatis setelah transaksi berhasil

## 🎨 Receipt Template
Template struk menggunakan format yang menarik dengan:
- 📱 Header dengan border ASCII
- 🏪 Informasi toko
- 📅 Tanggal dan waktu transaksi
- 👤 Data pelanggan
- 📦 Detail pembelian dengan numbering
- 💰 Ringkasan pembayaran
- 🎯 Diskon dan pajak (jika ada)
- 💳 Metode pembayaran dengan emoji
- ✨ Pesan terima kasih
- 🤖 Footer branding

## 🔧 Configuration Functions

### Check Configuration
```typescript
import { isWhatsAppConfigured } from '@/lib/whatsapp-config';

const configured = isWhatsAppConfigured();
```

### Get Configuration Hints
```typescript
import { getConfigurationHints } from '@/lib/whatsapp-config';

const hints = getConfigurationHints('waha');
```

### Create Service Instance
```typescript
import { createWhatsAppServiceInstance } from '@/lib/whatsapp-config';

const service = createWhatsAppServiceInstance();
```

## 🧪 Testing

### Prerequisites
1. ✅ Customer dengan nomor WhatsApp di database
2. ✅ Environment variables dikonfigurasi
3. ✅ WhatsApp API platform aktif
4. ✅ Development server running

### Test Steps
1. Buka halaman Transaksi Jualan
2. Pilih produk dan tambah ke keranjang
3. Pilih pelanggan yang memiliki nomor WhatsApp
4. Centang "Kirim struk via WhatsApp"
5. Lihat indikator hijau "Struk akan dikirim via WhatsApp"
6. Klik "Proses Transaksi"
7. Cek notifikasi toast untuk status pengiriman
8. Verifikasi penerimaan pesan di WhatsApp

## 🐛 Troubleshooting

### Common Issues

**1. WhatsApp option tidak muncul**
- Cek environment variables
- Pastikan `isWhatsAppConfigured()` return true

**2. Pelanggan tidak bisa dipilih untuk WhatsApp**
- Pastikan customer memiliki nomor `phone` di database
- Cek format nomor telepon (harus valid Indonesia)

**3. Pesan tidak terkirim**
- Cek koneksi ke WhatsApp API
- Verifikasi API key dan session ID
- Cek logs di browser console

**4. Format nomor salah**
- Nomor akan otomatis diformat ke +62xxx
- Pastikan nomor dimulai dengan 08xxx atau 62xxx

## 📊 Database Requirements

### Customer Table
```sql
-- Pastikan kolom phone ada dan nullable
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS phone TEXT;
```

### Sample Data
```sql
-- Insert customer dengan WhatsApp
INSERT INTO customers (name, email, phone) 
VALUES ('John Doe', 'john@example.com', '085123456789');
```

## 🔒 Security Notes

1. **API Keys**: Jangan commit API keys ke repository
2. **Environment**: Gunakan `.env.local` untuk production
3. **Validation**: Selalu validasi nomor WhatsApp
4. **Rate Limiting**: Implementasi rate limiting untuk mencegah spam

## 🚀 Production Deployment

### Environment Setup
```bash
# Copy environment template
cp .env.example .env.production

# Configure WhatsApp settings
VITE_WHATSAPP_PLATFORM=your_chosen_platform
VITE_WHATSAPP_API_URL=your_api_url
VITE_WHATSAPP_API_KEY=your_production_api_key
```

### Monitoring
- Monitor API usage dan rate limits
- Track delivery success rate
- Log error untuk debugging
- Setup alerts untuk API failures

## 📈 Future Enhancements

### Planned Features
- [ ] Template customization
- [ ] Delivery status tracking
- [ ] Bulk receipt sending
- [ ] WhatsApp Business API integration
- [ ] Message scheduling
- [ ] Customer opt-out management

### Advanced Features
- [ ] Rich media support (images, PDFs)
- [ ] Interactive buttons
- [ ] Customer feedback collection
- [ ] Analytics dashboard
- [ ] Multi-language support

---

## 📞 Support

Untuk bantuan teknis atau pertanyaan:
- 📧 Email: support@vibecodingpos.com
- 💬 WhatsApp: +62xxx-xxxx-xxxx
- 📚 Documentation: `/docs/`

---

*Last updated: January 2025*
*Version: 1.0.0*