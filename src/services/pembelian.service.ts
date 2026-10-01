import type { Role } from "@models/auth.model";
import type {
  CheckoutItemDto,
  CheckoutResult,
  RiwayatPembelian,
  StatusPembelian,
} from "@models/pembelian.model";
import * as pembelianRepo from "@repositories/pembelian.repository";

export async function checkout(
  pelangganId: number,
  items: CheckoutItemDto[]
): Promise<CheckoutResult> {
  return await pembelianRepo.createCheckout(pelangganId, items);
}

export async function getRiwayat(akunId: number, role: Role): Promise<RiwayatPembelian[]> {
  if (role === "admin") {
    return await pembelianRepo.findRiwayatSemua();
  }

  return await pembelianRepo.findRiwayatByPelanggan(akunId);
}

export async function changeStatus(
  pembelianId: number,
  status: StatusPembelian,
  akunId: number,
  role: Role
): Promise<void> {
  return await pembelianRepo.ubahStatusPembelian(pembelianId, status, akunId, role);
}
