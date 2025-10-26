import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Loader2 } from "lucide-react";
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface TransactionItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Transaction {
  id: string;
  transaction_number: string;
  customer_name: string | null;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  payment_method: string;
  created_at: string;
  transaction_items: TransactionItem[];
}

const TransaksiPage = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeId, setStoreId] = useState<string>('');
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch store data
  const fetchStoreData = async () => {
    if (!user?.id) return;
    
    try {
      const { data: storeData, error } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (error) throw error;
      if (storeData) {
        setStoreId(storeData.id);
      }
    } catch (error) {
      console.error('Error fetching store:', error);
    }
  };

  // Fetch transactions with items
  const fetchTransactions = async () => {
    if (!storeId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id,
          transaction_number,
          subtotal,
          discount_amount,
          tax_amount,
          total_amount,
          payment_method,
          created_at,
          customers (
            name
          ),
          transaction_items (
            id,
            quantity,
            unit_price,
            total_price,
            products (
              name
            )
          )
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match expected interface
      const transformedData = data?.map(transaction => ({
        ...transaction,
        customer_name: transaction.customers?.name || null,
        transaction_items: transaction.transaction_items?.map(item => ({
          id: item.id,
          product_name: item.products?.name || 'Unknown Product',
          quantity: item.quantity,
          price: item.unit_price,
          subtotal: item.total_price
        })) || []
      })) || [];
      
      setTransactions(transformedData);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStoreData();
    }
  }, [user]);

  useEffect(() => {
    if (storeId) {
      fetchTransactions();
    }
  }, [storeId]);

  const filteredTransactions = transactions.filter((t) => {
    if (!startDate && !endDate) return true;
    
    // Convert transaction date to local date for comparison
    const transactionDate = new Date(t.created_at);
    const transactionLocalDate = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), transactionDate.getDate());
    
    // Create start and end dates in local timezone
    const start = startDate ? new Date(startDate + 'T00:00:00') : new Date(0);
    const end = endDate ? new Date(endDate + 'T23:59:59.999') : new Date();
    
    return transactionLocalDate >= start && transactionLocalDate <= end;
  });

  const totalPendapatan = filteredTransactions.reduce((sum, t) => sum + t.total_amount, 0);

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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Riwayat Transaksi</h1>
        <p className="text-muted-foreground mt-1">Lihat semua transaksi yang telah dilakukan</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filter Berdasarkan Tanggal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Tanggal Mulai</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Tanggal Selesai</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Total Pendapatan</Label>
              <div className="text-2xl font-bold text-accent">
                {formatCurrency(totalPendapatan)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="border rounded-lg">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Memuat data transaksi...</span>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Transaksi</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Metode Bayar</TableHead>
                <TableHead>Diskon</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {startDate || endDate ? 'Tidak ada transaksi pada periode yang dipilih' : 'Belum ada transaksi'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.transaction_number}</TableCell>
                    <TableCell>{formatDate(transaction.created_at)}</TableCell>
                    <TableCell>{transaction.customer_name || 'Walk-in Customer'}</TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        {transaction.transaction_items.map((item) => (
                          <div key={item.id}>
                            {item.product_name} x{item.quantity}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{transaction.payment_method}</TableCell>
                    <TableCell>{formatCurrency(transaction.discount_amount)}</TableCell>
                    <TableCell className="text-right font-medium text-accent">
                      {formatCurrency(transaction.total_amount)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default TransaksiPage;
