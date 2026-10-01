export interface TambahStokDto {
  alat_id: number;
  jumlah: number;
}

export interface StokAlat {
  stok_id: number;
  alat_id: number;
  nama_alat: string;
  jumlah: number;
  nama_admin: string | null;
  updated_at: Date;
}
