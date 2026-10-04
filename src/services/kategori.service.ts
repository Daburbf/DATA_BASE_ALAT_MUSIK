import type { DaftarKategori, Kategori, KategoriDto } from "@models/kategori.model";
import * as kategoriRepo from "@repositories/kategori.repository";
import { AppError } from "@utils/app-error";

export async function getAllKategori(): Promise<Kategori[]> {
  return await kategoriRepo.findAllKategori();
}

//kategori
export async function getDaftarKategori(): Promise<DaftarKategori[]> {
  return await kategoriRepo.findDaftarKategori();
}

export async function createKategori(data: KategoriDto): Promise<Kategori> {
  return await kategoriRepo.insertKategori(data);
}

export async function updateKategori(id: number, data: KategoriDto): Promise<Kategori> {
  const kategori = await kategoriRepo.updateKategoriById(id, data);

  if (!kategori) {
    throw new AppError("Kategori tidak ditemukan", 404);
  }

  return kategori;
}

export async function deleteKategori(id: number): Promise<void> {
  const deleted = await kategoriRepo.deleteKategoriById(id);

  if (!deleted) {
    throw new AppError("Kategori tidak ditemukan", 404);
  }
}
