import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { dummyProduk, dummyPelanggan, type Produk } from "@/data/dummyData";
import { ShoppingCart, Trash2, Plus } from "lucide-react";

interface CartItem {
  produk: Produk;
  quantity: number;
}

const TransaksiJualan = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProdukId, setSelectedProdukId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedPelangganId, setSelectedPelangganId] = useState("walk-in");
  const [diskon, setDiskon] = useState(0);

  const handleAddToCart = () => {
    if (!selectedProdukId) {
      toast.error("Pilih produk terlebih dahulu!");
      return;
    }

    const produk = dummyProduk.find((p) => p.id === selectedProdukId);
    if (!produk) return;

    const existingItem = cart.find((item) => item.produk.id === selectedProdukId);
    
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.produk.id === selectedProdukId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setCart([...cart, { produk, quantity }]);
    }

    toast.success(`${produk.nama} ditambahkan ke keranjang`);
    setSelectedProdukId("");
    setQuantity(1);
  };

  const handleRemoveFromCart = (produkId: string) => {
    setCart(cart.filter((item) => item.produk.id !== produkId));
    toast.success("Item dihapus dari keranjang");
  };

  const subtotal = cart.reduce((sum, item) => sum + item.produk.harga * item.quantity, 0);
  const total = subtotal - diskon;

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Keranjang masih kosong!");
      return;
    }

    const pelangganNama = selectedPelangganId && selectedPelangganId !== "walk-in"
      ? dummyPelanggan.find((p) => p.id === selectedPelangganId)?.nama || "Walk-in Customer"
      : "Walk-in Customer";

    toast.success(`Transaksi berhasil! Total: Rp ${total.toLocaleString()}`);
    
    // Reset form
    setCart([]);
    setSelectedPelangganId("walk-in");
    setDiskon(0);
  };

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
                <Label htmlFor="produk">Pilih Produk</Label>
                <Select value={selectedProdukId} onValueChange={setSelectedProdukId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih produk" />
                  </SelectTrigger>
                  <SelectContent>
                    {dummyProduk.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nama} - Rp {p.harga.toLocaleString()} (Stok: {p.stok})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Jumlah</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>

              <Button onClick={handleAddToCart} className="w-full">
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
                <Label htmlFor="pelanggan">Pelanggan (Opsional)</Label>
                <Select value={selectedPelangganId} onValueChange={setSelectedPelangganId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih pelanggan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                    {dummyPelanggan.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="diskon">Diskon (Rp)</Label>
                <Input
                  id="diskon"
                  type="number"
                  min="0"
                  value={diskon}
                  onChange={(e) => setDiskon(Number(e.target.value))}
                />
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
                <p className="text-center text-muted-foreground py-8">Keranjang masih kosong</p>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produk</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Harga</TableHead>
                        <TableHead>Subtotal</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.map((item) => (
                        <TableRow key={item.produk.id}>
                          <TableCell className="font-medium">{item.produk.nama}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>Rp {item.produk.harga.toLocaleString()}</TableCell>
                          <TableCell>Rp {(item.produk.harga * item.quantity).toLocaleString()}</TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveFromCart(item.produk.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-lg">
                <span>Subtotal:</span>
                <span>Rp {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg text-destructive">
                <span>Diskon:</span>
                <span>- Rp {diskon.toLocaleString()}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-2xl font-bold text-accent">
                <span>Total:</span>
                <span>Rp {total.toLocaleString()}</span>
              </div>
              <Button onClick={handleCheckout} className="w-full mt-4" size="lg">
                Proses Transaksi
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TransaksiJualan;
