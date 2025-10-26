import { createMailketingService } from './mailketing';

interface TransactionData {
  transaction_number: string;
  customer_name: string;
  customer_email: string;
  store_name: string;
  store_address?: string;
  store_phone?: string;
  store_email?: string;
  cashier_name?: string;
  created_at: string;
  payment_method: string;
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  total_amount: number;
  discount_amount?: number;
  tax_amount?: number;
}

export class EmailService {
  private static instance: EmailService;
  private mailketingService = createMailketingService();

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendReceiptEmail(transactionData: TransactionData): Promise<{ success: boolean; message: string }> {
    if (!transactionData.customer_email || !this.isValidEmail(transactionData.customer_email)) {
      return {
        success: false,
        message: 'Email pelanggan tidak valid atau tidak tersedia'
      };
    }

    console.log('📧 EmailService: Memulai pengiriman email via Mailketing...');

    // Use Mailketing only
    if (!this.mailketingService) {
      return {
        success: false,
        message: 'Mailketing service tidak dikonfigurasi'
      };
    }

    try {
      console.log('📧 EmailService: Mengirim email via Mailketing...');
      const mailketingResult = await this.sendViaMailketing(transactionData);
      
      if (mailketingResult.success) {
        console.log('✅ EmailService: Email berhasil dikirim via Mailketing');
        return mailketingResult;
      } else {
        console.log('❌ EmailService: Mailketing gagal:', mailketingResult.message);
        return {
          success: false,
          message: `Gagal mengirim email via Mailketing: ${mailketingResult.message}`
        };
      }
    } catch (error) {
      console.error('❌ EmailService: Mailketing error:', error);
      return {
        success: false,
        message: `Error mengirim email: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async sendViaMailketing(transactionData: TransactionData): Promise<{ success: boolean; message: string }> {
    if (!this.mailketingService) {
      return {
        success: false,
        message: 'Mailketing service tidak tersedia'
      };
    }

    const emailContent = this.formatReceiptEmailHTML(transactionData);
    
    return await this.mailketingService.sendEmail({
      to: transactionData.customer_email,
      toName: transactionData.customer_name,
      subject: `Struk Transaksi ${transactionData.transaction_number} - ${transactionData.store_name}`,
      content: emailContent,
    });
  }



  public isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private formatReceiptEmailHTML(data: TransactionData): string {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount).replace('IDR', 'Rp');
    };

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    const formatTime = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    };

    const subtotal = data.items.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = data.discount_amount || 0;
    const taxAmount = data.tax_amount || 0;

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Struk Transaksi - ${data.transaction_number}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 40px 20px;
          background-color: #f0f0f0;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }
        
        .email-container {
          width: 100%;
          max-width: 600px;
          background-color: #ffffff;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          display: flex;
          justify-content: center;
        }
        
        .receipt-container {
          font-family: 'Courier New', monospace;
          background: #ffffff;
          width: 320px;
          padding: 20px;
          border: 2px solid #000;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          margin: 0;
          font-size: 11px;
          line-height: 1.3;
          color: #000;
          position: relative;
        }
        
        .receipt-container::before {
          content: '';
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 30px;
          height: 10px;
          background: #ddd;
          border-radius: 0 0 5px 5px;
        }
        
        /* Header Toko */
        .header {
          text-align: center;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 2px solid #000;
        }
        
        .store-name {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .store-info {
          font-size: 10px;
          margin-bottom: 2px;
          color: #333;
        }
        
        .divider {
          border: none;
          border-top: 1px dashed #000;
          margin: 8px 0;
          height: 1px;
        }
        
        .divider-solid {
          border: none;
          border-top: 1px solid #000;
          margin: 6px 0;
          height: 1px;
        }
        
        /* Informasi Transaksi */
        .transaction-info {
          margin-bottom: 12px;
          font-size: 11px;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
          align-items: center;
        }
        
        .info-label {
          font-weight: bold;
          min-width: 100px;
        }
        
        .info-value {
          text-align: right;
          flex: 1;
        }
        
        /* Tabel Item */
        .items-section {
          margin-bottom: 12px;
        }
        
        .items-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #000;
          padding-bottom: 4px;
          margin-bottom: 6px;
          font-weight: bold;
          font-size: 11px;
          text-transform: uppercase;
        }
        
        .item-name-header {
          flex: 1;
          text-align: left;
          min-width: 120px;
        }
        
        .item-qty-header {
          width: 35px;
          text-align: center;
        }
        
        .item-price-header {
          width: 75px;
          text-align: right;
          padding-right: 8px;
        }
        
        .item-total-header {
          width: 80px;
          text-align: right;
        }
        
        .item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 5px;
          font-size: 11px;
          padding: 2px 0;
          border-bottom: 1px dotted #ccc;
        }
        
        .item-name {
          flex: 1;
          text-align: left;
          min-width: 140px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          padding-right: 5px;
        }
        
        .item-qty {
          width: 35px;
          text-align: center;
          font-weight: bold;
        }
        
        .item-price {
          width: 75px;
          text-align: right;
          font-size: 10px;
          padding-right: 8px;
        }
        
        .item-total {
          width: 80px;
          text-align: right;
          font-weight: bold;
          font-size: 11px;
        }
        
        /* Ringkasan Pembayaran */
        .summary {
          border-top: 2px solid #000;
          padding-top: 10px;
          margin-bottom: 15px;
        }
        
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
          font-size: 12px;
          align-items: center;
        }
        
        .summary-label {
          font-weight: bold;
          min-width: 120px;
        }
        
        .summary-value {
          text-align: right;
          flex: 1;
        }
        
        .discount-row {
          color: #d32f2f;
          font-weight: bold;
        }
        
        .total-row {
          border-top: 2px solid #000;
          padding-top: 8px;
          margin-top: 8px;
          font-weight: bold;
          font-size: 16px;
          text-transform: uppercase;
        }
        
        .total-label {
          font-size: 16px;
          font-weight: bold;
        }
        
        .total-value {
          font-size: 18px;
          font-weight: bold;
        }
        
        .payment-info {
          margin-bottom: 15px;
          font-size: 12px;
          background-color: #f9f9f9;
          padding: 8px;
          border: 1px solid #ddd;
        }
        
        .payment-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
          align-items: center;
        }
        
        .payment-label {
          font-weight: bold;
          min-width: 120px;
        }
        
        .payment-value {
          text-align: right;
          flex: 1;
          font-weight: bold;
        }
        
        /* Footer */
        .footer {
          text-align: center;
          border-top: 2px dashed #000;
          padding-top: 15px;
          font-size: 11px;
          line-height: 1.5;
        }
        
        .thank-you {
          font-weight: bold;
          font-size: 14px;
          margin-bottom: 10px;
          text-transform: uppercase;
          color: #2e7d32;
        }
        
        .return-policy {
          margin-bottom: 8px;
          font-style: italic;
          color: #666;
          border: 1px dashed #999;
          padding: 8px;
          background-color: #fafafa;
        }
        
        .return-policy-title {
          font-weight: bold;
          margin-bottom: 3px;
          color: #333;
        }
        
        .contact-info {
          margin-top: 15px;
          padding-top: 10px;
          border-top: 1px solid #ddd;
        }
        
        .email-info {
          margin-bottom: 5px;
          font-weight: bold;
          color: #1976d2;
        }
        
        .branding {
          font-weight: bold;
          color: #4caf50;
          font-size: 12px;
          margin-top: 5px;
        }
        
        .timestamp {
          margin-top: 10px;
          font-size: 9px;
          color: #999;
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="receipt-container">
        <!-- Header Toko -->
        <div class="header">
          <div class="store-name">${data.store_name}</div>
          ${data.store_address ? `<div class="store-info">${data.store_address}</div>` : ''}
          ${data.store_phone ? `<div class="store-info">Telp: ${data.store_phone}</div>` : ''}
          ${data.store_email ? `<div class="store-info">Email: ${data.store_email}</div>` : ''}
        </div>

        <!-- Informasi Transaksi -->
        <div class="transaction-info">
          <div class="info-row">
            <span class="info-label">No. Transaksi:</span>
            <span class="info-value">${data.transaction_number}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Tanggal:</span>
            <span class="info-value">${formatDate(data.created_at)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Waktu:</span>
            <span class="info-value">${formatTime(data.created_at)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Kasir:</span>
            <span class="info-value">${data.cashier_name || 'Admin'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Customer:</span>
            <span class="info-value">${data.customer_name}</span>
          </div>
        </div>

        <hr class="divider">

        <!-- Tabel Item -->
        <div class="items-section">
          <div class="items-header">
            <span class="item-name-header">Item</span>
            <span class="item-qty-header">Qty</span>
            <span class="item-price-header">Harga</span>
            <span class="item-total-header">Total</span>
          </div>
          ${data.items.map(item => `
            <div class="item-row">
              <span class="item-name">${item.product_name}</span>
              <span class="item-qty">${item.quantity}</span>
              <span class="item-price">${formatCurrency(item.price)}</span>
              <span class="item-total">${formatCurrency(item.total)}</span>
            </div>
          `).join('')}
        </div>

        <!-- Ringkasan Pembayaran -->
        <div class="summary">
          <div class="summary-row">
            <span class="summary-label">Subtotal:</span>
            <span class="summary-value">${formatCurrency(subtotal)}</span>
          </div>
          ${discountAmount > 0 ? `
          <div class="summary-row discount-row">
            <span class="summary-label">Diskon:</span>
            <span class="summary-value">-${formatCurrency(discountAmount)}</span>
          </div>
          ` : ''}
          <div class="summary-row">
            <span class="summary-label">Pajak:</span>
            <span class="summary-value">${formatCurrency(taxAmount)}</span>
          </div>
          <div class="summary-row total-row">
            <span class="total-label">TOTAL:</span>
            <span class="total-value">${formatCurrency(data.total_amount)}</span>
          </div>
        </div>

        <!-- Metode Pembayaran -->
        <div class="payment-info">
          <div class="payment-row">
            <span class="payment-label">Metode Pembayaran:</span>
            <span class="payment-value">${data.payment_method}</span>
          </div>
        </div>

        <hr class="divider">

        <!-- Footer -->
        <div class="footer">
          <div class="thank-you">Terima Kasih Atas Kunjungan Anda!</div>
          
          <div class="return-policy">
            <div class="return-policy-title">Kebijakan Pengembalian:</div>
            <div>Barang yang sudah dibeli tidak dapat dikembalikan</div>
            <div>kecuali ada perjanjian khusus sebelumnya</div>
          </div>
          
          <div class="contact-info">
            <div class="email-info">Email Customer: ${data.customer_email}</div>
            <div class="branding">Powered by VibePOS</div>
            <div class="timestamp">Dicetak pada: ${new Date().toLocaleString('id-ID')}</div>
          </div>
        </div>
      </div>
      </div>
    </body>
    </html>
    `;
  }

  // Test methods
  async testMailketing(): Promise<{ success: boolean; message: string }> {
    if (!this.mailketingService) {
      return {
        success: false,
        message: 'Mailketing tidak dikonfigurasi. Periksa environment variables VITE_MAILKETING_API_TOKEN dan VITE_MAILKETING_FROM_EMAIL'
      };
    }

    return await this.mailketingService.testConnection();
  }

  async testEmail(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🧪 Testing Email Service...');
      
      const testData: TransactionData = {
        transaction_number: 'TEST-001',
        customer_name: 'Test Customer',
        customer_email: import.meta.env.VITE_MAILKETING_FROM_EMAIL || 'test@example.com',
        store_name: 'VibePOS Test Store',
        store_address: 'Test Address',
        store_phone: '081234567890',
        created_at: new Date().toISOString(),
        payment_method: 'Cash',
        items: [
          {
            product_name: 'Test Product',
            quantity: 1,
            price: 10000,
            total: 10000
          }
        ],
        total_amount: 10000
      };

      const result = await this.sendReceiptEmail(testData);
      return result;
    } catch (error) {
      console.error('❌ Email test error:', error);
      return {
        success: false,
        message: `Error testing email: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();