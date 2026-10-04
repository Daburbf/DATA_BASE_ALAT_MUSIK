export interface KategoriDto {
  nama_kategori: string;
  deskripsi?: string;
}

export interface Kategori {
  id: number;
  nama_kategori: string;
  deskripsi: string | null;
  created_at: Date;
}

//kategori
export interface DaftarKategori {
  id: number;
  nama_kategori: string;
  deskripsi: string | null;
  created_at: Date;
  jumlah_alat: number;
  total_stok: number;
}
