// WhatsApp Service untuk integrasi dengan berbagai platform
// Mendukung: WAHA, DripSender, StarSender

export interface WhatsAppConfig {
  platform: 'waha' | 'dripsender' | 'starsender' | 'wablas';
  apiUrl: string;
  apiKey?: string;
  sessionId?: string; // untuk WAHA
  deviceId?: string; // untuk DripSender/StarSender
}

export interface WhatsAppMessage {
  to: string; // nomor WhatsApp (format: 62xxx)
  message: string;
  type?: 'text' | 'image' | 'document';
}

export interface TransactionData {
  transactionNumber: string;
  customerName: string;
  storeName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  date: string;
  time: string;
}

class WhatsAppService {
  private config: WhatsAppConfig;

  constructor(config: WhatsAppConfig) {
    this.config = config;
  }

  // Format nomor WhatsApp ke format internasional
  private formatPhoneNumber(phone: string): string {
    // Hapus semua karakter non-digit
    let cleaned = phone.replace(/\D/g, '');
    
    // Jika dimulai dengan 0, ganti dengan 62
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    }
    
    // Jika belum ada kode negara, tambahkan 62
    if (!cleaned.startsWith('62')) {
      cleaned = '62' + cleaned;
    }
    
    return cleaned;
  }

  // Generate template struk WhatsApp
  generateReceiptMessage(data: TransactionData): string {
    const formatCurrency = (amount: number) => {
      return `Rp ${amount.toLocaleString('id-ID')}`;
    };

    const itemsList = data.items
      .map((item) => {
        const unitPrice = item.total / item.quantity;
        return `${item.name.padEnd(20)} ${item.quantity.toString().padStart(3)} ${formatCurrency(unitPrice).padStart(12)} ${formatCurrency(item.total).padStart(15)}`;
      })
      .join('\n');

    const subtotalAmount = data.subtotal;
    const taxAmount = data.tax || 0;

    return `                    ${data.storeName}

No. Transaksi:${data.transactionNumber}
Tanggal:${data.date}, ${data.time}
Kasir:Admin
Customer:${data.customerName}

${'-'.repeat(70)}
Item                     Qty        Harga           Total
${itemsList}
${'-'.repeat(70)}

Subtotal:${formatCurrency(subtotalAmount).padStart(15)}
Pajak:${formatCurrency(taxAmount).padStart(18)}
${'-'.repeat(70)}
TOTAL:${formatCurrency(data.total).padStart(17)}

Pembayaran:${data.paymentMethod.toUpperCase()}

${'-'.repeat(70)}

                Terima kasih telah berbelanja!
            Barang yang sudah dibeli tidak dapat dikembalikan
                        kecuali ada perjanjian khusus

                    Email: devantri1@gmail.com
                      Powered by VibePOS`;
  }

  // Kirim pesan via WAHA
  private async sendViaWAHA(message: WhatsAppMessage): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.apiUrl}/api/sendText`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session: this.config.sessionId || 'default',
          chatId: `${message.to}@c.us`,
          text: message.message,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending via WAHA:', error);
      return false;
    }
  }

  // Kirim pesan via DripSender
  private async sendViaDripSender(message: WhatsAppMessage): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.apiUrl}/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          phone: message.to,
          message: message.message,
          device_id: this.config.deviceId,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending via DripSender:', error);
      return false;
    }
  }

  // Kirim pesan via StarSender
  private async sendViaStarSender(message: WhatsAppMessage): Promise<boolean> {
    try {
      // StarSender memerlukan device ID
      const deviceId = this.config.deviceId;
      if (!deviceId) {
        console.error('Device ID is required for StarSender');
        return false;
      }

      // Format nomor untuk StarSender (harus dengan @s.whatsapp.net)
      const formattedTo = message.to.includes('@') ? message.to : `${message.to}@s.whatsapp.net`;
      
      // Gunakan endpoint /sendText dengan parameter URL sesuai dokumentasi resmi
      const baseUrl = this.config.apiUrl.replace('/send', ''); // Remove /send if exists
      const url = `${baseUrl}/sendText?id_device=${deviceId}&message=${encodeURIComponent(message.message)}&tujuan=${encodeURIComponent(formattedTo)}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'apikey': this.config.apiKey, // StarSender menggunakan header 'apikey'
        },
      });

      if (response.ok) {
        console.log('StarSender message sent successfully');
        return true;
      } else {
        const errorText = await response.text();
        console.error('StarSender error response:', errorText);
        return false;
      }
    } catch (error) {
      console.error('Error sending via StarSender:', error);
      return false;
    }
  }

  // Kirim pesan via Wablas
  private async sendViaWablas(message: WhatsAppMessage): Promise<boolean> {
    try {
      if (!this.config.apiKey) {
        console.error('API Key is required for Wablas');
        return false;
      }

      // Format nomor untuk Wablas (tanpa @s.whatsapp.net)
      const formattedTo = message.to.replace('@s.whatsapp.net', '');
      
      // Wablas menggunakan POST dengan JSON body
      const url = `${this.config.apiUrl}/api/send-message`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.config.apiKey, // Wablas menggunakan header 'Authorization'
        },
        body: JSON.stringify({
          phone: formattedTo,
          message: message.message,
          isGroup: false
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Wablas message sent successfully:', result);
        return true;
      } else {
        const errorText = await response.text();
        console.error('Wablas error response:', errorText);
        return false;
      }
    } catch (error) {
      console.error('Error sending via Wablas:', error);
      return false;
    }
  }

  // Method utama untuk kirim pesan
  async sendMessage(to: string, message: string): Promise<boolean> {
    const formattedPhone = this.formatPhoneNumber(to);
    
    const whatsappMessage: WhatsAppMessage = {
      to: formattedPhone,
      message,
      type: 'text',
    };

    switch (this.config.platform) {
      case 'waha':
        return await this.sendViaWAHA(whatsappMessage);
      case 'dripsender':
        return await this.sendViaDripSender(whatsappMessage);
      case 'starsender':
        return await this.sendViaStarSender(whatsappMessage);
      case 'wablas':
        return await this.sendViaWablas(whatsappMessage);
      default:
        console.error('Platform WhatsApp tidak didukung:', this.config.platform);
        return false;
    }
  }

  // Method untuk kirim struk transaksi
  async sendReceipt(phoneNumber: string, transactionData: TransactionData): Promise<boolean> {
    if (!phoneNumber || phoneNumber.trim() === '') {
      console.error('Nomor WhatsApp tidak tersedia');
      return false;
    }

    const receiptMessage = this.generateReceiptMessage(transactionData);
    return await this.sendMessage(phoneNumber, receiptMessage);
  }

  // Validasi nomor WhatsApp
  isValidWhatsAppNumber(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    // Nomor Indonesia harus dimulai dengan 62 dan minimal 10 digit
    return /^62\d{9,}$/.test(this.formatPhoneNumber(cleaned));
  }
}

// Factory function untuk membuat instance WhatsApp service
export function createWhatsAppService(config: WhatsAppConfig): WhatsAppService {
  return new WhatsAppService(config);
}

// Default export
export default WhatsAppService;