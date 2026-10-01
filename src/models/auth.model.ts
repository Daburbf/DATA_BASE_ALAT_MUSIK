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
