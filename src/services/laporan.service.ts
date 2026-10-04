import type {
  AlatTerlaris,
  LaporanPenjualanBulanan,
  LogAktivitas,
  PendapatanPerKategori,
  PenjualanPerBulan,
} from "@models/laporan.model";
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

//laporan
export async function getPendapatanPerKategori(): Promise<PendapatanPerKategori[]> {
  return await laporanRepo.findPendapatanPerKategori();
}

export async function getPenjualanPerBulan(tahun?: number): Promise<PenjualanPerBulan[]> {
  return await laporanRepo.findPenjualanPerBulan(tahun);
}

export async function getSemuaLogAktivitas(
  sumber?: string,
  limit?: number
): Promise<LogAktivitas[]> {
  return await laporanRepo.findSemuaLogAktivitas(sumber, limit);
}
