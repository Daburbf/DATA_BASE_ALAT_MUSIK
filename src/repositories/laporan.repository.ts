import { pool } from "@config/db";
import type {
  AlatTerlaris,
  LaporanPenjualanBulanan,
  LogAktivitas,
  PendapatanPerKategori,
  PenjualanPerBulan,
} from "@models/laporan.model";

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

// View pecahan untuk controller laporan: pendapatan per kategori.
export async function findPendapatanPerKategori(): Promise<PendapatanPerKategori[]> {
  const res = await pool.query<PendapatanPerKategori>("SELECT * FROM v_pendapatan_per_kategori");
  return res.rows;
}

// View pecahan untuk controller laporan: rekap per bulan (opsional filter tahun).
export async function findPenjualanPerBulan(tahun?: number): Promise<PenjualanPerBulan[]> {
  if (tahun !== undefined) {
    const res = await pool.query<PenjualanPerBulan>(
      "SELECT * FROM v_penjualan_per_bulan WHERE tahun = $1",
      [tahun]
    );
    return res.rows;
  }

  const res = await pool.query<PenjualanPerBulan>("SELECT * FROM v_penjualan_per_bulan");
  return res.rows;
}

// View pecahan untuk controller laporan: semua log dengan filter sumber + limit.
export async function findSemuaLogAktivitas(
  sumber?: string,
  limit = 100
): Promise<LogAktivitas[]> {
  const batas = Number.isInteger(limit) && limit > 0 && limit <= 500 ? limit : 100;

  if (sumber) {
    const res = await pool.query<LogAktivitas>(
      "SELECT * FROM v_log_aktivitas WHERE sumber_event = $1 LIMIT $2",
      [sumber, batas]
    );
    return res.rows;
  }

  const res = await pool.query<LogAktivitas>("SELECT * FROM v_log_aktivitas LIMIT $1", [batas]);
  return res.rows;
}
