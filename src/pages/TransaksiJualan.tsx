import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus, Minus, ShoppingCart, User, Package, CreditCard, CheckCircle, AlertCircle, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { EmailService } from '@/lib/email';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category_name?: string;
  sku?: string;
}

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
}

const TransaksiJualan = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [storeId, setStoreId] = useState<string>('');
  const [storeName, setStoreName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'amount'>('percentage');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Email related states
  const [sendEmail, setSendEmail] = useState<boolean>(false);
  const [emailService] = useState(() => EmailService.getInstance());

  // Fetch store data and products/customers
  useEffect(() => {
    if (user) {
      fetchStoreData();
    }
  }, [user]);

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      
      // Get user's store
      const { data: stores, error: storeError } = await supabase
        .from('stores')
        .select('id, name')
        .eq('owner_id', user?.id)
        .single();

      if (storeError) throw storeError;
      
      if (stores) {
        setStoreId(stores.id);
        setStoreName(stores.name);
        await Promise.all([
          fetchProducts(stores.id),
          fetchCustomers(stores.id)
        ]);
      }
    } catch (error) {
      console.error('Error fetching store data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (storeId: string) => {
    try {
      const { data, error } = await supabase
        .from('products_with_category')
        .select('*')
        .eq('store_id', storeId)
        .eq('is_active', true)
        .gt('stock', 0)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCustomers = async (storeId: string) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('store_id', storeId)
        .order('name');

      if (error) throw error;
      
      // Add walk-in customer option
      const customersWithWalkIn = [
        { id: 'walk-in', name: 'Walk-in Customer', email: null, phone: null },
        ...(data || [])
      ];
      
      setCustomers(customersWithWalkIn);
      setSelectedCustomer('walk-in');
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleAddToCart = () => {
    if (!selectedProduct) {
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    if (product.stock <= 0) {
      return;
    }

    const existingItem = cart.find(item => item.id === selectedProduct);
    
    if (existingItem) {
      if (existingItem.quantity + 1 > product.stock) {
        return;
      }
      setCart(cart.map(item => 
        item.id === selectedProduct 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { 
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        stock: product.stock
      }]);
    }

    setSelectedProduct("");
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const item = cart.find(item => item.id === productId);
    if (!item) return;

    if (newQuantity > item.stock) {
      return;
    }

    setCart(cart.map(item => 
      item.id === productId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = discountType === 'percentage' ? (subtotal * discount / 100) : discount;
  const taxAmount = 0; // You can add tax calculation here if needed
  const total = subtotal - discountAmount + taxAmount;



  // Send Email receipt
  const sendEmailReceipt = async (transaction: any, customer: Customer) => {
    console.log('🚀 TransaksiJualan: Memulai pengiriman email receipt...');
    
    try {
      if (!customer.email) {
        throw new Error('Customer tidak memiliki email');
      }

      if (!emailService.isValidEmail(customer.email)) {
        throw new Error('Format email customer tidak valid');
      }

      const emailTransactionData = {
        id: transaction.id,
        transaction_number: transaction.transaction_number,
        customer_name: customer.name,
        customer_email: customer.email,
        total_amount: transaction.total_amount,
        payment_method: transaction.payment_method,
        discount_amount: transaction.discount_amount || 0,
        tax_amount: transaction.tax_amount || 0,
        created_at: transaction.created_at,
        store_name: storeName,
        store_address: '', // Add store address if available
        store_phone: '', // Add store phone if available
        items: cart.map(item => ({
          product_name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity
        }))
      };

      console.log('📧 TransaksiJualan: Memanggil emailService.sendReceiptEmail...');
      const response = await emailService.sendReceiptEmail(emailTransactionData);
      console.log('📧 TransaksiJualan: Response dari emailService:', response);
      
      if (response.success) {
        console.log('✅ TransaksiJualan: Email berhasil dikirim via Mailketing');
        toast({
          title: "Struk Email Terkirim",
          description: `Struk berhasil dikirim ke ${customer.email} via Mailketing`,
          duration: 5000,
        });
      } else {
        console.log('❌ TransaksiJualan: Email gagal dikirim via Mailketing:', response.message);
        throw new Error(response.message || 'Gagal mengirim struk email via Mailketing');
      }
    } catch (error) {
      console.error('❌ TransaksiJualan: Error sending email receipt:', error);
      
      let errorMessage = "Terjadi kesalahan saat mengirim struk";
      
      if (error instanceof Error) {
        // Provide more user-friendly error messages
        if (error.message.includes('koneksi') || error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = "Gagal terhubung ke server email. Periksa koneksi internet dan coba lagi.";
        } else if (error.message.includes('email tidak valid')) {
          errorMessage = "Format email customer tidak valid. Periksa alamat email.";
        } else if (error.message.includes('tidak memiliki email')) {
          errorMessage = "Customer tidak memiliki alamat email.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Gagal Kirim Struk Email",
        description: errorMessage,
        variant: "destructive",
        duration: 7000,
      });
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      return;
    }

    if (!storeId) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          store_id: storeId,
          customer_id: selectedCustomer === 'walk-in' ? null : selectedCustomer,
          subtotal: subtotal,
          discount_amount: discountAmount,
          discount_percentage: discountType === 'percentage' ? discount : null,
          tax_amount: taxAmount,
          total_amount: total,
          payment_method: paymentMethod,
          notes: null
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Create transaction items
      const transactionItems = cart.map(item => ({
        transaction_id: transaction.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('transaction_items')
        .insert(transactionItems);

      if (itemsError) throw itemsError;



      // Send Email receipt if enabled and customer has email
      if (sendEmail && selectedCustomer !== 'walk-in') {
        const customer = customers.find(c => c.id === selectedCustomer);
        if (customer?.email) {
          console.log('📧 HandleCheckout: Memulai pengiriman email untuk customer:', customer.email);
          // Send Email receipt asynchronously (don't block the UI)
          // Add a small delay to ensure transaction is fully processed
          setTimeout(() => {
            sendEmailReceipt(transaction, customer);
          }, 500);
        } else {
          toast({
            title: "Tidak Bisa Kirim Email",
            description: "Customer tidak memiliki alamat email",
            variant: "destructive",
            duration: 3000,
          });
        }
      }

      // Show success message
      toast({
        title: "Transaksi Berhasil",
        description: `Transaksi ${transaction.transaction_number} berhasil diproses`,
        duration: 5000,
      });

      // Reset form
      setCart([]);
      setSelectedCustomer('walk-in');
      setDiscount(0);
      setPaymentMethod('cash');
      setSendEmail(false);

      // Refresh products to update stock
      if (storeId) {
        await fetchProducts(storeId);
      }

    } catch (error) {
      console.error('Error processing transaction:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Memuat data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Transaksi Jualan</h1>
        <p className="text-muted-foreground mt-1">Buat transaksi penjualan baru</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left side - Product Selection */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Tambah Produk
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product">Pilih Produk</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih produk" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        <div className="flex flex-col">
                          <span>{product.name}</span>
                          <span className="text-sm text-muted-foreground">
                            Rp {product.price.toLocaleString()} • Stok: {product.stock}
                            {product.category_name && ` • ${product.category_name}`}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleAddToCart} 
                className="w-full"
                disabled={!selectedProduct}
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah ke Keranjang
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informasi Tambahan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Pelanggan (Opsional)</Label>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih pelanggan" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        <div className="flex flex-col space-y-1 w-full">
                          <span className="font-medium">{customer.name}</span>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1 truncate flex-1">
                              📧 {customer.email || 'Tidak ada email'}
                            </span>
                            <span className={`flex items-center gap-1 ml-2 ${customer.phone ? 'text-green-600' : 'text-orange-500'}`}>
                              📱 {customer.phone || 'Belum ada'}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Customer Info */}
              {selectedCustomer && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-slate-900">Pelanggan Dipilih:</h4>
                      <p className="font-semibold text-slate-800">{customers.find(c => c.id === selectedCustomer)?.name}</p>
                      <div className="mt-1 space-y-1">
                        {customers.find(c => c.id === selectedCustomer)?.email && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span>📧</span>
                            <span>{customers.find(c => c.id === selectedCustomer)?.email}</span>
                          </div>
                        )}
                        {customers.find(c => c.id === selectedCustomer)?.phone && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span>📱</span>
                            <span>{customers.find(c => c.id === selectedCustomer)?.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}



              {/* Email Option */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sendEmail"
                    checked={sendEmail}
                    onCheckedChange={(checked) => setSendEmail(checked === true)}
                    disabled={!selectedCustomer || !customers.find(c => c.id === selectedCustomer)?.email}
                  />
                  <Label htmlFor="sendEmail" className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-blue-600" />
                    Kirim struk via Email
                  </Label>
                </div>
                {selectedCustomer && !customers.find(c => c.id === selectedCustomer)?.email && (
                  <p className="text-xs text-muted-foreground ml-6">
                    Pelanggan belum memiliki alamat email
                  </p>
                )}
                {!selectedCustomer && (
                  <p className="text-xs text-muted-foreground ml-6">
                    Pilih pelanggan terlebih dahulu
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountType">Tipe Diskon</Label>
                <Select value={discountType} onValueChange={(value: "percentage" | "amount") => setDiscountType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amount">Nilai (Rp)</SelectItem>
                    <SelectItem value="percentage">Persentase (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount">
                  Diskon {discountType === "percentage" ? "(%)" : "(Rp)"}
                </Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max={discountType === "percentage" ? 100 : undefined}
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Metode Pembayaran</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Tunai</SelectItem>
                    <SelectItem value="card">Kartu</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="qris">QRIS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right side - Cart */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Keranjang Belanja
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Keranjang masih kosong</p>
                </div>
              ) : (
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Rp {item.price.toLocaleString()} × {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-right min-w-[80px]">
                            <p className="font-medium">Rp {(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>Rp {subtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-destructive">
                    <span>Diskon {discountType === "percentage" ? `(${discount}%)` : ""}:</span>
                    <span>- Rp {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>Rp {total.toLocaleString()}</span>
                </div>
              </div>



              {/* Email Status Indicator */}
              {sendEmail && selectedCustomer && customers.find(c => c.id === selectedCustomer)?.email && (
                <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-700">Struk akan dikirim via Email</span>
                </div>
              )}
              
              <Button 
                onClick={handleCheckout} 
                className="w-full mt-4" 
                size="lg"
                disabled={cart.length === 0 || isProcessing}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {isProcessing ? 'Memproses...' : 'Proses Transaksi'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TransaksiJualan;
