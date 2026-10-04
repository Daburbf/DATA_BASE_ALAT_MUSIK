import { pool } from "@config/db";
import type {
  CheckoutItemDto,
  CheckoutResult,
  DaftarPembelian,
  DetailPembelian,
  RiwayatPembelian,
  StatusPembelian,
} from "@models/pembelian.model";
import type { Role } from "@models/auth.model";

export async function createCheckout(
  pelangganId: number,
  items: CheckoutItemDto[]
): Promise<CheckoutResult> {
  // node-pg tidak mengembalikan rows untuk CALL dengan parameter OUT,
  // maka dipakai wrapper FUNCTION yang me-return nilainya.
  const res = await pool.query<{ pembelian_id: number; total: number }>(
    "SELECT * FROM fn_checkout_pembelian($1, $2::jsonb)",
    [pelangganId, JSON.stringify(items)]
  );

  const row = res.rows[0];
  if (!row) {
    throw new Error("Checkout gagal: database tidak mengembalikan hasil");
  }
  return { pembelian_id: row.pembelian_id, total: row.total };
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

// View pecahan untuk controller pembelian: header (satu baris per transaksi).
export async function findDaftarPembelian(pelangganId?: number): Promise<DaftarPembelian[]> {
  if (pelangganId !== undefined) {
    const res = await pool.query<DaftarPembelian>(
      "SELECT * FROM v_daftar_pembelian WHERE pelanggan_id = $1",
      [pelangganId]
    );
    return res.rows;
  }

  const res = await pool.query<DaftarPembelian>("SELECT * FROM v_daftar_pembelian");
  return res.rows;
}

// View pecahan untuk controller pembelian: detail flat per item.
export async function findDetailPembelian(
  pembelianId?: number,
  pelangganId?: number
): Promise<DetailPembelian[]> {
  if (pembelianId !== undefined && pelangganId !== undefined) {
    const res = await pool.query<DetailPembelian>(
      "SELECT * FROM v_detail_pembelian WHERE pembelian_id = $1 AND pelanggan_id = $2",
      [pembelianId, pelangganId]
    );
    return res.rows;
  }

  if (pembelianId !== undefined) {
    const res = await pool.query<DetailPembelian>(
      "SELECT * FROM v_detail_pembelian WHERE pembelian_id = $1",
      [pembelianId]
    );
    return res.rows;
  }

  if (pelangganId !== undefined) {
    const res = await pool.query<DetailPembelian>(
      "SELECT * FROM v_detail_pembelian WHERE pelanggan_id = $1",
      [pelangganId]
    );
    return res.rows;
  }

  const res = await pool.query<DetailPembelian>("SELECT * FROM v_detail_pembelian");
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
