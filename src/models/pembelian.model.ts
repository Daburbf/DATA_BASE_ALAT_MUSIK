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

//pembelian
export interface DaftarPembelian {
  pembelian_id: number;
  pelanggan_id: number;
  nama_pelanggan: string;
  email_pelanggan: string;
  status: StatusPembelian;
  total: number;
  jumlah_item: number;
  tanggal_pembelian: Date;
}

//pembelian
export interface DetailPembelian {
  detail_id: number;
  pembelian_id: number;
  pelanggan_id: number;
  nama_pelanggan: string;
  alat_id: number;
  nama_alat: string;
  nama_kategori: string | null;
  jumlah: number;
  harga_satuan: number;
  subtotal: number;
  status_pembelian: StatusPembelian;
  tanggal_pembelian: Date;
}
