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
