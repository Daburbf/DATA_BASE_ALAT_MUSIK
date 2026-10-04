
export type Role = "admin" | "pelanggan";

export interface AuthUser {
  id: number;
  role: Role;
}

export interface RegisterDto {
  nama: string;
  email: string;
  password: string;
  telepon?: string;
  alamat?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AkunLogin {
  akun_id: number;
  nama: string;
  email: string;
  password: string;
  role: Role;
}

export interface LoginResult {
  token: string;
  akun: {
    id: number;
    nama: string;
    role: Role;
  };
}

// Baris dari v_daftar_admin.
export interface DaftarAdmin {
  admin_id: number;
  nama: string;
  email: string;
  created_at: Date;
}

// Baris dari v_daftar_pelanggan.
export interface DaftarPelanggan {
  pelanggan_id: number;
  nama: string;
  email: string;
  telepon: string | null;
  alamat: string | null;
  created_at: Date;
  jumlah_pembelian: number;
  total_belanja: number;
}
