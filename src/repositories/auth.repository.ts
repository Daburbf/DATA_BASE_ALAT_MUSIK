import { pool } from "@config/db";
import type { AkunLogin, DaftarAdmin, DaftarPelanggan } from "@models/auth.model";

interface CreatePelangganData {
  nama: string;
  email: string;
  passwordHash: string;
  telepon?: string;
  alamat?: string;
}

export async function findAkunByEmail(email: string): Promise<AkunLogin | null> {
  const res = await pool.query<AkunLogin>("SELECT * FROM fn_ambil_akun_login($1)", [email]);
  return res.rows[0] ?? null;
}

//auth
export async function findDaftarAdmin(): Promise<DaftarAdmin[]> {
  const res = await pool.query<DaftarAdmin>("SELECT * FROM v_daftar_admin");
  return res.rows;
}

export async function findDaftarPelanggan(): Promise<DaftarPelanggan[]> {
  const res = await pool.query<DaftarPelanggan>("SELECT * FROM v_daftar_pelanggan");
  return res.rows;
}

export async function deletePelanggan(pelangganId: number, akunId: number, role: string): Promise<void> {
  await pool.query("CALL sp_hapus_pelanggan($1, $2, $3)", [pelangganId, akunId, role]);
}

export async function createPelanggan(data: CreatePelangganData): Promise<number> {
  //auth
  const res = await pool.query<{ pelanggan_id: number }>(
    "SELECT fn_registrasi_pelanggan($1, $2, $3, $4, $5) AS pelanggan_id",
    [
      data.nama,
      data.email,
      data.passwordHash,
      data.telepon || null,
      data.alamat || null,
    ]
  );

  const pelangganId = res.rows[0]?.pelanggan_id;
  if (pelangganId === undefined || pelangganId === null) {
    throw new Error("Registrasi pelanggan gagal: database tidak mengembalikan id");
  }

  return pelangganId;
}
