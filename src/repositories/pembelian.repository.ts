import { pool } from "@config/db";
import type {
  CheckoutItemDto,
  CheckoutResult,
  RiwayatPembelian,
  StatusPembelian,
} from "@models/pembelian.model";
import type { Role } from "@models/auth.model";

export async function createCheckout(
  pelangganId: number,
  items: CheckoutItemDto[]
): Promise<CheckoutResult> {
  const res = await pool.query<{ p_pembelian_id: number; p_total: number }>(
    "CALL sp_checkout_pembelian($1, $2, NULL, NULL)",
    [pelangganId, JSON.stringify(items)]
  );

  const row = res.rows[0]!;
  return { pembelian_id: row.p_pembelian_id, total: row.p_total };
}

export async function findRiwayatByPelanggan(pelangganId: number): Promise<RiwayatPembelian[]> {
  const res = await pool.query<RiwayatPembelian>(
    "SELECT * FROM v_riwayat_pembelian WHERE pelanggan_id = $1",
    [pelangganId]
  );
  return res.rows;
}

export async function findRiwayatSemua(): Promise<RiwayatPembelian[]> {
  const res = await pool.query<RiwayatPembelian>("SELECT * FROM v_riwayat_pembelian");
  return res.rows;
}

export async function ubahStatusPembelian(
  pembelianId: number,
  status: StatusPembelian,
  akunId: number,
  role: Role
): Promise<void> {
  await pool.query("CALL sp_ubah_status_pembelian($1, $2, $3, $4)", [
    pembelianId,
    status,
    akunId,
    role,
  ]);
}
