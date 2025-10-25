import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dummyTransaksi, type Transaksi } from "@/data/dummyData";
import { Calendar } from "lucide-react";

const TransaksiPage = () => {
  const [transaksi] = useState<Transaksi[]>(dummyTransaksi);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredTransaksi = transaksi.filter((t) => {
    if (!startDate && !endDate) return true;
    const transaksiDate = new Date(t.tanggal);
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();
    return transaksiDate >= start && transaksiDate <= end;
  });

  const totalPendapatan = filteredTransaksi.reduce((sum, t) => sum + t.total, 0);

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
                Rp {totalPendapatan.toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Transaksi</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Pelanggan</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Diskon</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransaksi.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.id}</TableCell>
                <TableCell>{new Date(t.tanggal).toLocaleDateString("id-ID")}</TableCell>
                <TableCell>{t.pelangganNama}</TableCell>
                <TableCell>
                  <div className="text-sm space-y-1">
                    {t.items.map((item, idx) => (
                      <div key={idx}>
                        {item.produkNama} x{item.quantity}
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>Rp {t.diskon.toLocaleString()}</TableCell>
                <TableCell className="text-right font-medium text-accent">
                  Rp {t.total.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TransaksiPage;
