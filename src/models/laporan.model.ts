export interface LaporanPenjualanBulanan {
  total_transaksi: number;
  total_item_terjual: number;
  total_pendapatan: number;
}

export interface AlatTerlaris {
  alat_id: number;
  nama_alat: string;
  total_terjual: number;
  total_pendapatan: number;
}

export interface LogAktivitas {
  log_id: number;
  sumber_event: string;
  keterangan: string;
  created_at: Date;
}

// Baris dari v_pendapatan_per_kategori.
export interface PendapatanPerKategori {
  kategori_id: number;
  nama_kategori: string;
  jumlah_transaksi: number;
  total_terjual: number;
  total_pendapatan: number;
}

// Baris dari v_penjualan_per_bulan.
export interface PenjualanPerBulan {
  tahun: number;
  bulan: number;
  jumlah_transaksi: number;
  jumlah_item: number;
  pendapatan: number;
}
