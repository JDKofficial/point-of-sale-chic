import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Store, Building2 } from "lucide-react";

interface StoreProfile {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  logo_url: string | null;
}

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProfileModal = ({ open, onOpenChange }: ProfileModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [storeData, setStoreData] = useState<StoreProfile>({
    id: "",
    name: "",
    address: "",
    phone: "",
    logo_url: "",
  });

  // Load store data when modal opens
  useEffect(() => {
    if (open && user) {
      loadStoreData();
    }
  }, [open, user]);

  const loadStoreData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error loading store data:", error);
        toast.error("Gagal memuat data toko: " + error.message);
        return;
      }

      if (data) {
        setStoreData({
          id: data.id,
          name: data.name || "",
          address: data.address || "",
          phone: data.phone || "",
          logo_url: data.logo_url || "",
        });
      } else {
        // Jika store belum ada, buat store baru
        await createNewStore();
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Terjadi kesalahan saat memuat data: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const createNewStore = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("stores")
        .insert({
          owner_id: user.id,
          name: "Toko Saya",
          address: null,
          phone: null,
          logo_url: null,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating store:", error);
        toast.error("Gagal membuat data toko baru");
        return;
      }

      if (data) {
        setStoreData({
          id: data.id,
          name: data.name || "",
          address: data.address || "",
          phone: data.phone || "",
          logo_url: data.logo_url || "",
        });
        toast.success("Data toko baru berhasil dibuat!");
      }
    } catch (error) {
      console.error("Error creating store:", error);
      toast.error("Terjadi kesalahan saat membuat toko baru");
    }
  };

  const handleInputChange = (field: keyof StoreProfile, value: string) => {
    setStoreData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("User tidak ditemukan");
      return;
    }

    if (!storeData.id) {
      toast.error("Data toko tidak ditemukan. Silakan tutup dan buka kembali modal ini.");
      return;
    }

    // Validation
    if (!storeData.name.trim()) {
      toast.error("Nama toko harus diisi");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("stores")
        .update({
          name: storeData.name.trim(),
          address: storeData.address.trim() || null,
          phone: storeData.phone.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", storeData.id);

      if (error) {
        console.error("Error updating store:", error);
        toast.error("Gagal menyimpan data toko: " + error.message);
        return;
      }

      toast.success("Profil toko berhasil diperbarui!");
      onOpenChange(false);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Terjadi kesalahan saat menyimpan data: " + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset form to original data
    loadStoreData();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Profil Toko
          </DialogTitle>
          <DialogDescription>
            Edit informasi toko Anda. Pastikan data yang dimasukkan akurat.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 animate-spin" />
              <span>Memuat data toko...</span>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="store-name">
                Nama Toko <span className="text-red-500">*</span>
              </Label>
              <Input
                id="store-name"
                value={storeData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Masukkan nama toko"
                disabled={saving}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="store-address">Alamat Toko</Label>
              <Textarea
                id="store-address"
                value={storeData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Masukkan alamat lengkap toko"
                rows={3}
                disabled={saving}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="store-phone">Nomor Telepon</Label>
              <Input
                id="store-phone"
                type="tel"
                value={storeData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Contoh: 08123456789"
                disabled={saving}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={saving || loading}
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || loading || !storeData.name.trim()}
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;