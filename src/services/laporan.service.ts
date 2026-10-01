import type { AlatTerlaris, LaporanPenjualanBulanan, LogAktivitas } from "@models/laporan.model";
import * as laporanRepo from "@repositories/laporan.repository";

export async function getPenjualanBulanan(
  bulan: number,
  tahun: number
): Promise<LaporanPenjualanBulanan> {
  return await laporanRepo.findPenjualanBulanan(bulan, tahun);
}

export async function getAlatTerlaris(): Promise<AlatTerlaris[]> {
  return await laporanRepo.findAlatTerlaris();
}

export async function getLogAktivitas(): Promise<LogAktivitas[]> {
  return await laporanRepo.findLogAktivitas();
}
