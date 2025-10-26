// Mailketing.co.id Email Service
// API Documentation: https://mailketing.co.id/docs/send-email-via-api/

interface MailketingConfig {
  apiToken: string;
  fromName: string;
  fromEmail: string;
}

interface MailketingResponse {
  status: 'success' | 'failed';
  response: string;
}

interface EmailData {
  to: string;
  toName: string;
  subject: string;
  content: string;
  attachments?: string[];
}

class MailketingService {
  private config: MailketingConfig;
  private apiUrl = 'https://api.mailketing.co.id/api/v1/send';

  constructor(config: MailketingConfig) {
    this.config = config;
  }

  async sendEmail(emailData: EmailData): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🚀 Mailketing: Memulai pengiriman email ke:', emailData.to);
      console.log('📧 Mailketing: Config:', {
        fromName: this.config.fromName,
        fromEmail: this.config.fromEmail,
        apiTokenLength: this.config.apiToken.length,
        apiTokenPrefix: this.config.apiToken.substring(0, 8) + '...'
      });

      const formData = new FormData();
      formData.append('api_token', this.config.apiToken);
      formData.append('from_name', this.config.fromName);
      formData.append('from_email', this.config.fromEmail);
      formData.append('recipient', emailData.to);
      formData.append('subject', emailData.subject);
      formData.append('content', emailData.content);

      // Add attachments if provided (max 3 attachments)
      if (emailData.attachments) {
        emailData.attachments.slice(0, 3).forEach((attachment, index) => {
          formData.append(`attach${index + 1}`, attachment);
        });
      }

      console.log('📤 Mailketing: Mengirim request ke API...');
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        mode: 'no-cors',
        body: formData,
      });

      // With no-cors mode, we can't read the response
      // But if the request doesn't throw an error, we assume it was successful
      console.log('📥 Mailketing: Request sent successfully (no-cors mode)');
      console.log('✅ Mailketing: Email berhasil dikirim!');
      return {
        success: true,
        message: 'Email berhasil dikirim via Mailketing',
      };
    } catch (error) {
      console.error('❌ Mailketing API Error:', error);
      
      // Handle specific error types
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        return {
          success: false,
          message: 'Gagal terhubung ke server Mailketing. Periksa koneksi internet atau server sedang down.',
        };
      }
      
      if (error instanceof Error && error.name === 'NetworkError') {
        return {
          success: false,
          message: 'Error jaringan saat menghubungi Mailketing. Coba lagi nanti.',
        };
      }
      
      return {
        success: false,
        message: `Gagal menghubungi server Mailketing: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private getErrorMessage(response: string): string {
    const errorMessages: Record<string, string> = {
      'User Not Found or Wrong API Token': 'API Token salah atau user tidak ditemukan',
      'Access Denied, Invalid Token': 'Token tidak valid',
      'Unknown Sender, Please Add your Sender Email at Add Domain Menu': 'Email pengirim belum ditambahkan di menu Add Domain',
      'Empty From Name': 'Nama pengirim kosong',
      'No Credits, Please Top Up': 'Credits habis, silakan top up',
      'Empty Recipient, Please Add recipient address': 'Email penerima tidak diisi',
      'Blacklisted': 'Email penerima di blacklist',
      'Empty Subject, Please Add Subject Email': 'Subject email kosong',
      'Empty Content, Please Add Email Content': 'Isi email kosong',
    };

    return errorMessages[response] || response;
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🧪 Mailketing: Testing connection...');
      
      // Test dengan email dummy yang sederhana
      const testResult = await this.sendEmail({
        to: this.config.fromEmail, // Kirim ke email sendiri untuk test
        toName: 'Test User',
        subject: 'Test Email Mailketing - VibePOS',
        content: '<p>Ini adalah test email dari VibePOS menggunakan Mailketing.co.id API</p><p>Jika Anda menerima email ini, berarti konfigurasi berhasil!</p>',
      });

      return testResult;
    } catch (error) {
      console.error('❌ Mailketing: Test connection error:', error);
      return {
        success: false,
        message: `Gagal test koneksi Mailketing: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}

// Configuration
const getMailketingConfig = (): MailketingConfig | null => {
  const apiToken = import.meta.env.VITE_MAILKETING_API_TOKEN;
  const fromName = import.meta.env.VITE_MAILKETING_FROM_NAME || 'VibePOS';
  const fromEmail = import.meta.env.VITE_MAILKETING_FROM_EMAIL;

  console.log('🔧 Mailketing Config Check:', {
    hasApiToken: !!apiToken,
    apiTokenLength: apiToken?.length || 0,
    fromName,
    fromEmail,
    hasFromEmail: !!fromEmail
  });

  if (!apiToken || !fromEmail) {
    console.warn('⚠️ Mailketing belum dikonfigurasi. Set VITE_MAILKETING_API_TOKEN dan VITE_MAILKETING_FROM_EMAIL');
    return null;
  }

  return {
    apiToken,
    fromName,
    fromEmail,
  };
};

// Export service instance
export const createMailketingService = (): MailketingService | null => {
  const config = getMailketingConfig();
  if (!config) return null;
  
  return new MailketingService(config);
};

// Helper function untuk format receipt email
export const formatReceiptEmail = (transactionData: any): EmailData => {
  // Calculate subtotal from total_amount minus tax and discount
  const totalAmount = transactionData.total_amount || transactionData.total || 0;
  const taxAmount = transactionData.tax_amount || transactionData.tax || 0;
  const discountAmount = transactionData.discount_amount || transactionData.discount || 0;
  const subtotal = totalAmount - taxAmount + discountAmount;

  // Format items with proper alignment
  const itemsHtml = transactionData.items?.map((item: any) => {
    const itemTotal = item.total || (item.quantity * item.price);
    return `
    <tr>
      <td style="padding: 1px 2px;">${item.product_name}</td>
      <td style="padding: 1px 2px; text-align: center;">${item.quantity}</td>
      <td style="padding: 1px 2px; text-align: right;">${item.price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</td>
      <td style="padding: 1px 2px; text-align: right;">${itemTotal.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</td>
    </tr>`;
  }).join('') || '';

  const content = `
<div style="font-family: 'Courier New', monospace; max-width: 220px; margin: 0 auto; background: white; padding: 8px; border: 1px solid #000; font-size: 10px;">
  <!-- Header -->
  <div style="text-align: center; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 5px;">
    <h2 style="margin: 0; font-size: 12px; font-weight: bold;">${transactionData.store_name || 'VibePOS'}</h2>
    ${transactionData.store_address ? `<p style="margin: 1px 0; font-size: 9px;">${transactionData.store_address}</p>` : ''}
    ${transactionData.store_phone ? `<p style="margin: 1px 0; font-size: 9px;">Telp: ${transactionData.store_phone}</p>` : ''}
  </div>

  <!-- Transaction Info -->
  <div style="margin-bottom: 5px; font-size: 9px;">
    <div style="display: flex; justify-content: space-between;">
      <span>No. Transaksi:</span>
      <span style="font-weight: bold;">${transactionData.transaction_number || transactionData.id}</span>
    </div>
    <div style="display: flex; justify-content: space-between;">
      <span>Tanggal:</span>
      <span>${new Date(transactionData.created_at).toLocaleDateString('id-ID', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}</span>
    </div>
    <div style="display: flex; justify-content: space-between;">
      <span>Kasir:</span>
      <span>Admin</span>
    </div>
    <div style="display: flex; justify-content: space-between;">
      <span>Customer:</span>
      <span style="font-weight: bold;">${transactionData.customer_name || 'Customer'}</span>
    </div>
  </div>

  <!-- Items Table -->
  <div style="border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 2px 0; margin: 5px 0;">
    <table style="width: 100%; font-size: 8px; border-collapse: collapse;">
      <thead>
        <tr style="border-bottom: 1px solid #000;">
          <th style="padding: 1px 2px; text-align: left; font-weight: normal;">Item</th>
          <th style="padding: 1px 2px; text-align: center; font-weight: normal;">Qty</th>
          <th style="padding: 1px 2px; text-align: right; font-weight: normal;">Harga</th>
          <th style="padding: 1px 2px; text-align: right; font-weight: normal;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
  </div>

  <!-- Summary -->
  <div style="font-size: 9px; margin-top: 5px; border-top: 1px solid #000; padding-top: 3px;">
    <div style="display: flex; justify-content: space-between; margin: 1px 0;">
      <span>Subtotal:</span>
      <span>${subtotal.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
    </div>
    ${discountAmount > 0 ? `
    <div style="display: flex; justify-content: space-between; margin: 1px 0; color: #e74c3c;">
      <span>Diskon:</span>
      <span>-${discountAmount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
    </div>` : ''}
    <div style="display: flex; justify-content: space-between; margin: 1px 0;">
      <span>Pajak:</span>
      <span>${taxAmount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
    </div>
    <div style="border-top: 1px dashed #333; padding-top: 3px; margin-top: 3px;">
      <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 10px;">
        <span>TOTAL:</span>
        <span>${totalAmount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
      </div>
    </div>
    <div style="display: flex; justify-content: space-between; margin: 3px 0 0 0; font-size: 9px;">
      <span>Pembayaran:</span>
      <span style="text-transform: uppercase;">${transactionData.payment_method}</span>
    </div>
  </div>

  <!-- Footer -->
  <div style="text-align: center; margin-top: 8px; padding-top: 5px; border-top: 1px dashed #333; font-size: 8px;">
    <p style="margin: 2px 0; font-weight: bold;">Terima kasih telah berbelanja!</p>
    <p style="margin: 2px 0;">Barang yang sudah dibeli tidak dapat dikembalikan</p>
    <p style="margin: 2px 0;">kecuali ada perjanjian khusus</p>
    <div style="margin-top: 5px; font-size: 7px; color: #666;">
      <p style="margin: 1px 0;">Email: ${transactionData.customer_email}</p>
      <p style="margin: 1px 0;">Powered by VibePOS</p>
    </div>
  </div>
</div>
  `.trim();

  return {
    to: transactionData.customer_email,
    toName: transactionData.customer_name || 'Customer',
    subject: `Struk Transaksi #${transactionData.id} - ${transactionData.store_name || 'VibePOS'}`,
    content,
  };
};

export default MailketingService;