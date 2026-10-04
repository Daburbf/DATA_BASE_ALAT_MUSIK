import type { RingkasanStok, StokAlat, TambahStokDto } from "@models/stok.model";
import * as stokRepo from "@repositories/stok.repository";

export async function getAllStok(): Promise<StokAlat[]> {
  return await stokRepo.findAllStok();
}

// View untuk controller stok: satu baris ringkasan.
export async function getRingkasanStok(): Promise<RingkasanStok> {
  return await stokRepo.findRingkasanStok();
}

export async function addStok(data: TambahStokDto, adminId: number): Promise<void> {
  return await stokRepo.tambahStok(data, adminId);
}

export async function addStokBatch(items: TambahStokDto[], adminId: number): Promise<void> {
  const sortedItems = [...items].sort((a, b) => a.alat_id - b.alat_id);
  return await stokRepo.tambahStokBatch(sortedItems, adminId);
}

export async function updateStok(stokId: number, jumlah: number, adminId: number): Promise<void> {
  return await stokRepo.ubahStok(stokId, jumlah, adminId);
}
