import type { Role } from "@models/auth.model";
import type {
  CheckoutItemDto,
  CheckoutResult,
  DaftarPembelian,
  DetailPembelian,
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

// View pecahan untuk controller pembelian: header per transaksi.
export async function getDaftarPembelian(akunId: number, role: Role): Promise<DaftarPembelian[]> {
  if (role === "admin") {
    return await pembelianRepo.findDaftarPembelian();
  }

  return await pembelianRepo.findDaftarPembelian(akunId);
}

// View pecahan untuk controller pembelian: detail flat per item.
export async function getDetailPembelian(
  akunId: number,
  role: Role,
  pembelianId?: number
): Promise<DetailPembelian[]> {
  if (role === "admin") {
    return await pembelianRepo.findDetailPembelian(pembelianId);
  }

  return await pembelianRepo.findDetailPembelian(pembelianId, akunId);
}

export async function changeStatus(
  pembelianId: number,
  status: StatusPembelian,
  akunId: number,
  role: Role
): Promise<void> {
  return await pembelianRepo.ubahStatusPembelian(pembelianId, status, akunId, role);
}
