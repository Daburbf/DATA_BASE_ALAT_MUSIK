import { pool, withTransaction } from "@config/db";
import type { RingkasanStok, StokAlat, TambahStokDto } from "@models/stok.model";

export async function findAllStok(): Promise<StokAlat[]> {
  const res = await pool.query<StokAlat>("SELECT * FROM v_stok_alat");
  return res.rows;
}

//stok
export async function findRingkasanStok(): Promise<RingkasanStok> {
  const res = await pool.query<RingkasanStok>("SELECT * FROM v_ringkasan_stok");
  const row = res.rows[0];
  if (!row) {
    return { total_alat: 0, total_unit: 0, stok_kosong: 0, stok_menipis: 0 };
  }
  return row;
}

export async function tambahStok(data: TambahStokDto, adminId: number): Promise<void> {
  await pool.query("CALL sp_tambah_stok($1, $2, $3)", [data.alat_id, data.jumlah, adminId]);
}

export async function tambahStokBatch(items: TambahStokDto[], adminId: number): Promise<void> {
  await withTransaction(async (client) => {
    for (const item of items) {
      await client.query("CALL sp_tambah_stok($1, $2, $3)", [item.alat_id, item.jumlah, adminId]);
    }
  });
}

export async function ubahStok(stokId: number, jumlah: number, adminId: number): Promise<void> {
  await pool.query("CALL sp_ubah_stok($1, $2, $3)", [stokId, jumlah, adminId]);
}
