import type { AlatDto, KatalogAlat } from "@models/alat.model";
import * as alatRepo from "@repositories/alat.repository";
import { AppError } from "@utils/app-error";

export async function getKatalogAlat(kategoriId?: number): Promise<KatalogAlat[]> {
  return await alatRepo.findKatalogAlat(kategoriId);
}

export async function getDetailAlat(id: number): Promise<KatalogAlat> {
  const alat = await alatRepo.findAlatById(id);

  if (!alat) {
    throw new AppError("Alat musik tidak ditemukan", 404);
  }

  return alat;
}

export async function createAlat(data: AlatDto): Promise<number> {
  return await alatRepo.insertAlat(data);
}

export async function updateAlat(id: number, data: AlatDto): Promise<void> {
  const updated = await alatRepo.updateAlatById(id, data);

  if (!updated) {
    throw new AppError("Alat musik tidak ditemukan", 404);
  }
}

export async function deleteAlat(id: number): Promise<void> {
  const deleted = await alatRepo.deleteAlatById(id);

  if (!deleted) {
    throw new AppError("Alat musik tidak ditemukan", 404);
  }
}
