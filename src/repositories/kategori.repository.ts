import { pool } from "@config/db";
import type { Kategori, KategoriDto } from "@models/kategori.model";

export async function findAllKategori(): Promise<Kategori[]> {
  const res = await pool.query<Kategori>("SELECT * FROM kategori ORDER BY id DESC");
  return res.rows;
}

export async function insertKategori(data: KategoriDto): Promise<Kategori> {
  const res = await pool.query<Kategori>(
    "INSERT INTO kategori (nama_kategori, deskripsi) VALUES ($1, $2) RETURNING *",
    [data.nama_kategori.trim(), data.deskripsi || null]
  );
  return res.rows[0]!;
}

export async function updateKategoriById(id: number, data: KategoriDto): Promise<Kategori | null> {
  const res = await pool.query<Kategori>(
    "UPDATE kategori SET nama_kategori = $1, deskripsi = $2 WHERE id = $3 RETURNING *",
    [data.nama_kategori.trim(), data.deskripsi || null, id]
  );
  return res.rows[0] ?? null;
}

export async function deleteKategoriById(id: number): Promise<boolean> {
  const res = await pool.query("DELETE FROM kategori WHERE id = $1", [id]);
  return (res.rowCount ?? 0) > 0;
}
