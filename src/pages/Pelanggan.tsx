import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { dummyPelanggan, type Pelanggan } from "@/data/dummyData";

const Pelanggan = () => {
  const [pelanggan, setPelanggan] = useState<Pelanggan[]>(dummyPelanggan);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPelanggan, setEditingPelanggan] = useState<Pelanggan | null>(null);
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    telepon: "",
    alamat: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPelanggan) {
      setPelanggan(pelanggan.map(p => 
        p.id === editingPelanggan.id 
          ? { ...p, ...formData }
          : p
      ));
      toast.success("Pelanggan berhasil diupdate!");
    } else {
      const newPelanggan: Pelanggan = {
        id: String(pelanggan.length + 1),
        ...formData,
      };
      setPelanggan([...pelanggan, newPelanggan]);
      toast.success("Pelanggan berhasil ditambahkan!");
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (p: Pelanggan) => {
    setEditingPelanggan(p);
    setFormData({
      nama: p.nama,
      email: p.email,
      telepon: p.telepon,
      alamat: p.alamat,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setPelanggan(pelanggan.filter(p => p.id !== id));
    toast.success("Pelanggan berhasil dihapus!");
  };

  const resetForm = () => {
    setFormData({ nama: "", email: "", telepon: "", alamat: "" });
    setEditingPelanggan(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pelanggan</h1>
          <p className="text-muted-foreground mt-1">Kelola data pelanggan</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Tambah Pelanggan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPelanggan ? "Edit Pelanggan" : "Tambah Pelanggan Baru"}</DialogTitle>
              <DialogDescription>
                {editingPelanggan ? "Update informasi pelanggan" : "Tambahkan pelanggan baru"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap</Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telepon">Telepon</Label>
                <Input
                  id="telepon"
                  value={formData.telepon}
                  onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alamat">Alamat</Label>
                <Input
                  id="alamat"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editingPelanggan ? "Update Pelanggan" : "Tambah Pelanggan"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telepon</TableHead>
              <TableHead>Alamat</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pelanggan.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.nama}</TableCell>
                <TableCell>{p.email}</TableCell>
                <TableCell>{p.telepon}</TableCell>
                <TableCell>{p.alamat}</TableCell>
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

export default Pelanggan;
