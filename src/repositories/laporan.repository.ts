import { pool } from "@config/db";
import type { AlatTerlaris, LaporanPenjualanBulanan, LogAktivitas } from "@models/laporan.model";

export async function findPenjualanBulanan(
  bulan: number,
  tahun: number
): Promise<LaporanPenjualanBulanan> {
  const res = await pool.query<LaporanPenjualanBulanan>(
    "SELECT * FROM fn_laporan_penjualan_bulanan($1, $2)",
    [bulan, tahun]
  );
  return res.rows[0]!;
}

export async function findAlatTerlaris(): Promise<AlatTerlaris[]> {
  const res = await pool.query<AlatTerlaris>("SELECT * FROM v_alat_terlaris");
  return res.rows;
}

export async function findLogAktivitas(): Promise<LogAktivitas[]> {
  const res = await pool.query<LogAktivitas>("SELECT * FROM v_log_aktivitas_terbaru");
  return res.rows;
}
