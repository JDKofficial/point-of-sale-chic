import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, Receipt, TrendingUp, AlertTriangle } from "lucide-react";
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  store_id: string;
  store_name: string;
  today_sales: number;
  today_transactions: number;
  month_sales: number;
  month_transactions: number;
  total_products: number;
  low_stock_products: number;
  total_customers: number;
}

interface RecentTransaction {
  id: string;
  transaction_number: string;
  customer_name: string | null;
  total_amount: number;
  payment_method: string;
  created_at: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get user's store
      const { data: stores, error: storeError } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user?.id)
        .single();

      if (storeError) throw storeError;

      if (stores) {
        await Promise.all([
          fetchDashboardStats(stores.id),
          fetchRecentTransactions(stores.id)
        ]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async (storeId: string) => {
    try {
      const { data, error } = await supabase
        .from('dashboard_stats')
        .select('*')
        .eq('store_id', storeId)
        .single();

      if (error) throw error;
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchRecentTransactions = async (storeId: string) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id,
          transaction_number,
          total_amount,
          payment_method,
          created_at,
          customers (
            name
          )
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      
      const formattedTransactions = data?.map(transaction => ({
        id: transaction.id,
        transaction_number: transaction.transaction_number,
        customer_name: transaction.customers?.name || null,
        total_amount: transaction.total_amount,
        payment_method: transaction.payment_method,
        created_at: transaction.created_at
      })) || [];

      setRecentTransactions(formattedTransactions);
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Memuat data dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview sistem POS Anda {stats?.store_name && `- ${stats.store_name}`}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
            <Package className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_products || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.low_stock_products ? `${stats.low_stock_products} stok rendah` : 'Semua stok aman'}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pelanggan</CardTitle>
            <Users className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_customers || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Pelanggan terdaftar</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transaksi Hari Ini</CardTitle>
            <Receipt className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.today_transactions || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Bulan ini: {stats?.month_transactions || 0} transaksi
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendapatan Hari Ini</CardTitle>
            <TrendingUp className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.today_sales ? formatCurrency(stats.today_sales) : 'Rp 0'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Bulan ini: {stats?.month_sales ? formatCurrency(stats.month_sales) : 'Rp 0'}
            </p>
          </CardContent>
        </Card>

        {stats?.low_stock_products && stats.low_stock_products > 0 && (
          <Card className="hover:shadow-md transition-shadow border-orange-200 bg-orange-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">Peringatan Stok</CardTitle>
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-800">{stats.low_stock_products}</div>
              <p className="text-xs text-orange-600 mt-1">Produk stok rendah</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Transaksi Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {/* Header */}
                <div className="grid grid-cols-4 gap-4 p-3 bg-muted/30 rounded-lg font-medium text-sm">
                  <div>No. Transaksi</div>
                  <div>Pelanggan</div>
                  <div>Pembayaran</div>
                  <div className="text-right">Total & Waktu</div>
                </div>
                {/* Data Rows */}
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="grid grid-cols-4 gap-4 p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                    <div>
                      <p className="font-medium text-sm">{transaction.transaction_number}</p>
                    </div>
                    <div>
                      <p className="text-sm">{transaction.customer_name || 'Walk-in Customer'}</p>
                    </div>
                    <div>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {transaction.payment_method === 'cash' ? 'Tunai' : 
                         transaction.payment_method === 'card' ? 'Kartu' :
                         transaction.payment_method === 'transfer' ? 'Transfer' :
                         transaction.payment_method}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{formatCurrency(transaction.total_amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(transaction.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada transaksi hari ini</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
