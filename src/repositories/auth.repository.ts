import { pool } from "@config/db";
import type { AkunLogin } from "@models/auth.model";

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

export async function createPelanggan(data: CreatePelangganData): Promise<number> {
  const res = await pool.query<{ p_pelanggan_id: number }>(
    "CALL sp_registrasi_pelanggan($1, $2, $3, $4, $5, NULL)",
    [
      data.nama,
      data.email,
      data.passwordHash,
      data.telepon || null,
      data.alamat || null,
    ]
  );

  return res.rows[0]!.p_pelanggan_id;
}
