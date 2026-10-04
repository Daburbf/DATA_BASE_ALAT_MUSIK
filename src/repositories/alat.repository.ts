import { pool } from "@config/db";
import type { AlatDto, DaftarAlat, KatalogAlat } from "@models/alat.model";

export async function findKatalogAlat(kategoriId?: number): Promise<KatalogAlat[]> {
  if (kategoriId !== undefined) {
    const res = await pool.query<KatalogAlat>(
      "SELECT * FROM v_katalog_alat WHERE kategori_id = $1",
      [kategoriId]
    );
    return res.rows;
  }

  const res = await pool.query<KatalogAlat>("SELECT * FROM v_katalog_alat");
  return res.rows;
}

export async function findAlatById(id: number): Promise<KatalogAlat | null> {
  const res = await pool.query<KatalogAlat>("SELECT * FROM v_katalog_alat WHERE alat_id = $1", [id]);
  return res.rows[0] ?? null;
}

//alat
export async function findDaftarAlat(kategoriId?: number): Promise<DaftarAlat[]> {
  if (kategoriId !== undefined) {
    const res = await pool.query<DaftarAlat>(
      "SELECT * FROM v_daftar_alat WHERE kategori_id = $1",
      [kategoriId]
    );
    return res.rows;
  }

  const res = await pool.query<DaftarAlat>("SELECT * FROM v_daftar_alat");
  return res.rows;
}

export async function insertAlat(data: AlatDto): Promise<number> {
  const res = await pool.query<{ id: number }>(
    "INSERT INTO alat_musik (kategori_id, nama_alat, deskripsi, harga) VALUES ($1, $2, $3, $4) RETURNING id",
    [data.kategori_id ?? null, data.nama_alat.trim(), data.deskripsi || null, data.harga]
  );
  return res.rows[0]!.id;
}

export async function updateAlatById(id: number, data: AlatDto): Promise<boolean> {
  const res = await pool.query(
    "UPDATE alat_musik SET kategori_id = $1, nama_alat = $2, deskripsi = $3, harga = $4 WHERE id = $5",
    [data.kategori_id ?? null, data.nama_alat.trim(), data.deskripsi || null, data.harga, id]
  );
  return (res.rowCount ?? 0) > 0;
}

export async function deleteAlatById(id: number): Promise<boolean> {
  const res = await pool.query("DELETE FROM alat_musik WHERE id = $1", [id]);
  return (res.rowCount ?? 0) > 0;
}
