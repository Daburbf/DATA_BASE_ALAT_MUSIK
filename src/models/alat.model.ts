export interface AlatDto {
  kategori_id?: number | null;
  nama_alat: string;
  deskripsi?: string;
  harga: number;
}

export interface KatalogAlat {
  alat_id: number;
  nama_alat: string;
  deskripsi: string | null;
  harga: number;
  kategori_id: number | null;
  nama_kategori: string | null;
  jumlah_stok: number;
}

// Baris dari v_daftar_alat (dipakai admin, pecahan dari v_katalog_alat).
export interface DaftarAlat extends KatalogAlat {
  stok_id: number | null;
  created_at: Date;
}
