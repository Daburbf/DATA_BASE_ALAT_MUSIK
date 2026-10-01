import { pool, withTransaction } from "@config/db";
import type { StokAlat, TambahStokDto } from "@models/stok.model";

export async function findAllStok(): Promise<StokAlat[]> {
  const res = await pool.query<StokAlat>("SELECT * FROM v_stok_alat");
  return res.rows;
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
