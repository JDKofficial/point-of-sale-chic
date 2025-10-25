import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { dummyProduk, dummyKategori, type Produk } from "@/data/dummyData";

const Produk = () => {
  const [produk, setProduk] = useState<Produk[]>(dummyProduk);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduk, setEditingProduk] = useState<Produk | null>(null);
  const [formData, setFormData] = useState({
    nama: "",
    kategoriId: "",
    harga: "",
    stok: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingProduk) {
      setProduk(produk.map(p => 
        p.id === editingProduk.id 
          ? { ...p, ...formData, harga: Number(formData.harga), stok: Number(formData.stok) }
          : p
      ));
      toast.success("Produk berhasil diupdate!");
    } else {
      const newProduk: Produk = {
        id: String(produk.length + 1),
        ...formData,
        harga: Number(formData.harga),
        stok: Number(formData.stok),
      };
      setProduk([...produk, newProduk]);
      toast.success("Produk berhasil ditambahkan!");
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (p: Produk) => {
    setEditingProduk(p);
    setFormData({
      nama: p.nama,
      kategoriId: p.kategoriId,
      harga: String(p.harga),
      stok: String(p.stok),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setProduk(produk.filter(p => p.id !== id));
    toast.success("Produk berhasil dihapus!");
  };

  const resetForm = () => {
    setFormData({ nama: "", kategoriId: "", harga: "", stok: "" });
    setEditingProduk(null);
  };

  const getKategoriNama = (kategoriId: string) => {
    return dummyKategori.find(k => k.id === kategoriId)?.nama || "-";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Produk</h1>
          <p className="text-muted-foreground mt-1">Kelola produk yang dijual</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Tambah Produk
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProduk ? "Edit Produk" : "Tambah Produk Baru"}</DialogTitle>
              <DialogDescription>
                {editingProduk ? "Update informasi produk" : "Tambahkan produk baru ke inventory"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Produk</Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kategori">Kategori</Label>
                <Select
                  value={formData.kategoriId}
                  onValueChange={(value) => setFormData({ ...formData, kategoriId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {dummyKategori.map((k) => (
                      <SelectItem key={k.id} value={k.id}>
                        {k.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="harga">Harga (Rp)</Label>
                <Input
                  id="harga"
                  type="number"
                  value={formData.harga}
                  onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stok">Stok</Label>
                <Input
                  id="stok"
                  type="number"
                  value={formData.stok}
                  onChange={(e) => setFormData({ ...formData, stok: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editingProduk ? "Update Produk" : "Tambah Produk"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Produk</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {produk.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.nama}</TableCell>
                <TableCell>{getKategoriNama(p.kategoriId)}</TableCell>
                <TableCell>Rp {p.harga.toLocaleString()}</TableCell>
                <TableCell>{p.stok}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(p)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Produk;
