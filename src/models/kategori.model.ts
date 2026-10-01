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
