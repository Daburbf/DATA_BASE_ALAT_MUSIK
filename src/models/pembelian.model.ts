export type StatusPembelian = "pending" | "diproses" | "dikirim" | "selesai" | "dibatalkan";

export interface CheckoutItemDto {
  alat_id: number;
  jumlah: number;
}

export interface CheckoutResult {
  pembelian_id: number;
  total: number;
}

export interface RiwayatPembelian {
  pembelian_id: number;
  pelanggan_id: number;
  nama_pelanggan: string;
  status: StatusPembelian;
  total: number;
  tanggal_pembelian: Date;
  rincian: Array<{
    alat_id: number;
    nama_alat: string;
    jumlah: number;
    harga_satuan: number;
    subtotal: number;
  }>;
}
