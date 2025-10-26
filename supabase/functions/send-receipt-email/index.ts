import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

interface TransactionData {
  id: string;
  transaction_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  payment_method: string;
  discount_amount?: number;
  tax_amount?: number;
  created_at: string;
  store_name: string;
  store_address?: string;
  store_phone?: string;
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
}

function generateReceiptHTML(data: TransactionData): string {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const subtotal = data.total_amount - (data.tax_amount || 0) + (data.discount_amount || 0);

  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Struk Transaksi - ${data.transaction_number}</title>
      <style>
        body {
          font-family: 'Courier New', monospace;
          line-height: 1.2;
          color: #000;
          max-width: 400px;
          margin: 0 auto;
          padding: 10px;
          background-color: #fff;
          font-size: 12px;
        }
        .receipt-container {
          background: white;
          border: 1px solid #000;
          padding: 15px;
          margin: 0;
        }
        .header {
          text-align: center;
          border-bottom: 1px solid #000;
          padding-bottom: 10px;
          margin-bottom: 10px;
        }
        .store-name {
          font-size: 16px;
          font-weight: bold;
          color: #000;
          margin-bottom: 5px;
        }
        .store-info {
          color: #000;
          font-size: 11px;
        }
        .transaction-info {
          margin-bottom: 10px;
          padding: 0;
          background-color: transparent;
        }
        .info-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2px;
          font-size: 11px;
        }
        .info-label {
          font-weight: normal;
          color: #000;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 10px;
          font-size: 11px;
        }
        .items-table th,
        .items-table td {
          padding: 2px 4px;
          text-align: left;
          border: none;
        }
        .items-table th {
          background-color: transparent;
          font-weight: normal;
          color: #000;
          border-bottom: 1px solid #000;
        }
        .items-table .quantity,
        .items-table .price,
        .items-table .total {
          text-align: right;
        }
        .summary {
          border-top: 1px solid #000;
          padding-top: 5px;
          font-size: 11px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2px;
        }
        .summary-row.total {
          font-size: 12px;
          font-weight: bold;
          color: #000;
          border-top: 1px solid #000;
          padding-top: 5px;
          margin-top: 5px;
        }
        .payment-info {
          margin: 5px 0;
          padding: 0;
          background-color: transparent;
          font-size: 11px;
        }
        .footer {
          text-align: center;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid #000;
          color: #000;
          font-size: 10px;
        }
        .thank-you {
          font-size: 11px;
          color: #000;
          font-weight: normal;
          margin-bottom: 5px;
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <div class="header">
          <div class="store-name">${data.store_name}</div>
          ${data.store_address ? `<div class="store-info">${data.store_address}</div>` : ''}
          ${data.store_phone ? `<div class="store-info">Telp: ${data.store_phone}</div>` : ''}
        </div>

        <div class="transaction-info">
          <div class="info-item">
            <span class="info-label">No. Transaksi:</span>
            <span>${data.transaction_number}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Tanggal:</span>
            <span>${formatDate(data.created_at)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Kasir:</span>
            <span>Admin</span>
          </div>
          <div class="info-item">
            <span class="info-label">Customer:</span>
            <span>${data.customer_name}</span>
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>Produk</th>
              <th class="quantity">Qty</th>
              <th class="price">Harga</th>
              <th class="total">Total</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.map(item => `
              <tr>
                <td>${item.product_name}</td>
                <td class="quantity">${item.quantity}</td>
                <td class="price">${formatCurrency(item.price)}</td>
                <td class="total">${formatCurrency(item.total)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="summary">
          <div class="summary-row">
            <span>Subtotal:</span>
            <span>${formatCurrency(subtotal)}</span>
          </div>
          ${data.discount_amount ? `
            <div class="summary-row">
              <span>Diskon:</span>
              <span>-${formatCurrency(data.discount_amount)}</span>
            </div>
          ` : ''}
          ${data.tax_amount ? `
            <div class="summary-row">
              <span>Pajak:</span>
              <span>${formatCurrency(data.tax_amount)}</span>
            </div>
          ` : ''}
          <div class="summary-row total">
            <span>TOTAL:</span>
            <span>${formatCurrency(data.total_amount)}</span>
          </div>
        </div>

        <div class="payment-info">
          <div class="info-item">
            <span class="info-label">Pembayaran:</span>
            <span>${data.payment_method}</span>
          </div>
        </div>

        <div class="footer">
          <div class="thank-you">Terima kasih telah berbelanja!</div>
          <div>Barang yang sudah dibeli tidak dapat dikembalikan</div>
          <div>kecuali ada perjanjian khusus</div>
          <div style="margin-top: 15px;">
            <div>Email: devantri1@gmail.com</div>
            <div>Powered by VibePOS</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

const handler = async (request: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  try {
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          } 
        }
      );
    }

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY not configured' }),
        { 
          status: 500, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          } 
        }
      );
    }

    const transactionData: TransactionData = await request.json();

    if (!transactionData.customer_email) {
      return new Response(
        JSON.stringify({ error: 'Customer email is required' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          } 
        }
      );
    }

    const emailHTML = generateReceiptHTML(transactionData);

    const emailPayload = {
      from: 'noreply@yourdomain.com', // Ganti dengan domain yang sudah diverifikasi di Resend
      to: transactionData.customer_email,
      subject: `Struk Transaksi ${transactionData.transaction_number} - ${transactionData.store_name}`,
      html: emailHTML,
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailPayload),
    });

    const result = await response.json();

    if (response.ok) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email sent successfully',
          email_id: result.id 
        }),
        { 
          status: 200, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          } 
        }
      );
    } else {
      console.error('Resend API error:', result);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send email', 
          details: result 
        }),
        { 
          status: 500, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          } 
        }
      );
    }

  } catch (error) {
    console.error('Error in send-receipt-email function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      }
    );
  }
};

Deno.serve(handler);