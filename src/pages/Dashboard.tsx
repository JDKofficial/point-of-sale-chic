import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, Receipt, TrendingUp } from "lucide-react";

const stats = [
  {
    title: "Total Produk",
    value: "156",
    icon: Package,
    description: "Produk aktif",
    color: "text-primary",
  },
  {
    title: "Total Pelanggan",
    value: "89",
    icon: Users,
    description: "Pelanggan terdaftar",
    color: "text-accent",
  },
  {
    title: "Transaksi Hari Ini",
    value: "24",
    icon: Receipt,
    description: "+12% dari kemarin",
    color: "text-primary",
  },
  {
    title: "Pendapatan Hari Ini",
    value: "Rp 4.5jt",
    icon: TrendingUp,
    description: "+8% dari kemarin",
    color: "text-accent",
  },
];

const Dashboard = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview sistem POS Anda</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaksi Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div>
                  <p className="font-medium">Transaksi #{1000 + i}</p>
                  <p className="text-sm text-muted-foreground">Pelanggan: John Doe</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-accent">Rp {(150000 + i * 50000).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date().toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
