export interface Kategori {
  id: string;
  nama: string;
}

export interface Produk {
  id: string;
  nama: string;
  kategoriId: string;
  harga: number;
  stok: number;
}

export interface Pelanggan {
  id: string;
  nama: string;
  email: string;
  telepon: string;
  alamat: string;
}

export interface Transaksi {
  id: string;
  tanggal: Date;
  pelangganId?: string;
  pelangganNama: string;
  total: number;
  items: {
    produkId: string;
    produkNama: string;
    quantity: number;
    harga: number;
  }[];
  diskon: number;
}

export const dummyKategori: Kategori[] = [
  { id: "1", nama: "Elektronik" },
  { id: "2", nama: "Fashion" },
  { id: "3", nama: "Makanan & Minuman" },
  { id: "4", nama: "Kecantikan" },
  { id: "5", nama: "Olahraga" },
];

export const dummyProduk: Produk[] = [
  { id: "1", nama: "Laptop ASUS ROG", kategoriId: "1", harga: 15000000, stok: 5 },
  { id: "2", nama: "Mouse Wireless Logitech", kategoriId: "1", harga: 250000, stok: 15 },
  { id: "3", nama: "Keyboard Mechanical", kategoriId: "1", harga: 850000, stok: 8 },
  { id: "4", nama: "Kemeja Batik Premium", kategoriId: "2", harga: 350000, stok: 20 },
  { id: "5", nama: "Celana Jeans", kategoriId: "2", harga: 450000, stok: 12 },
  { id: "6", nama: "Kopi Arabica 100g", kategoriId: "3", harga: 85000, stok: 50 },
  { id: "7", nama: "Teh Hijau Premium", kategoriId: "3", harga: 65000, stok: 30 },
  { id: "8", nama: "Serum Wajah Vitamin C", kategoriId: "4", harga: 175000, stok: 25 },
  { id: "9", nama: "Sepatu Lari Nike", kategoriId: "5", harga: 1200000, stok: 10 },
  { id: "10", nama: "Matras Yoga", kategoriId: "5", harga: 250000, stok: 18 },
];

export const dummyPelanggan: Pelanggan[] = [
  {
    id: "1",
    nama: "Ahmad Wijaya",
    email: "ahmad@email.com",
    telepon: "081234567890",
    alamat: "Jl. Sudirman No. 123, Jakarta",
  },
  {
    id: "2",
    nama: "Siti Nurhaliza",
    email: "siti@email.com",
    telepon: "082345678901",
    alamat: "Jl. Gatot Subroto No. 45, Bandung",
  },
  {
    id: "3",
    nama: "Budi Santoso",
    email: "budi@email.com",
    telepon: "083456789012",
    alamat: "Jl. Diponegoro No. 67, Surabaya",
  },
  {
    id: "4",
    nama: "Dewi Lestari",
    email: "dewi@email.com",
    telepon: "084567890123",
    alamat: "Jl. Ahmad Yani No. 89, Yogyakarta",
  },
  {
    id: "5",
    nama: "Eko Prasetyo",
    email: "eko@email.com",
    telepon: "085678901234",
    alamat: "Jl. Pahlawan No. 12, Semarang",
  },
];

export const dummyTransaksi: Transaksi[] = [
  {
    id: "TRX001",
    tanggal: new Date("2025-01-20"),
    pelangganId: "1",
    pelangganNama: "Ahmad Wijaya",
    total: 15250000,
    diskon: 0,
    items: [
      { produkId: "1", produkNama: "Laptop ASUS ROG", quantity: 1, harga: 15000000 },
      { produkId: "2", produkNama: "Mouse Wireless Logitech", quantity: 1, harga: 250000 },
    ],
  },
  {
    id: "TRX002",
    tanggal: new Date("2025-01-21"),
    pelangganId: "2",
    pelangganNama: "Siti Nurhaliza",
    total: 765000,
    diskon: 35000,
    items: [
      { produkId: "4", produkNama: "Kemeja Batik Premium", quantity: 2, harga: 350000 },
      { produkId: "6", produkNama: "Kopi Arabica 100g", quantity: 1, harga: 85000 },
    ],
  },
  {
    id: "TRX003",
    tanggal: new Date("2025-01-22"),
    pelangganId: "3",
    pelangganNama: "Budi Santoso",
    total: 1450000,
    diskon: 50000,
    items: [
      { produkId: "9", produkNama: "Sepatu Lari Nike", quantity: 1, harga: 1200000 },
      { produkId: "10", produkNama: "Matras Yoga", quantity: 1, harga: 250000 },
    ],
  },
  {
    id: "TRX004",
    tanggal: new Date("2025-01-23"),
    pelangganNama: "Walk-in Customer",
    total: 195000,
    diskon: 0,
    items: [
      { produkId: "8", produkNama: "Serum Wajah Vitamin C", quantity: 1, harga: 175000 },
      { produkId: "7", produkNama: "Teh Hijau Premium", quantity: 1, harga: 65000 },
    ],
  },
  {
    id: "TRX005",
    tanggal: new Date("2025-01-24"),
    pelangganId: "5",
    pelangganNama: "Eko Prasetyo",
    total: 1700000,
    diskon: 100000,
    items: [
      { produkId: "3", produkNama: "Keyboard Mechanical", quantity: 2, harga: 850000 },
    ],
  },
];
