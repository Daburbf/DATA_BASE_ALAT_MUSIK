import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { jwtExpiresIn, jwtSecret } from "@config/jwt";
import type {
  DaftarAdmin,
  DaftarPelanggan,
  LoginDto,
  LoginResult,
  RegisterDto,
} from "@models/auth.model";
import * as authRepo from "@repositories/auth.repository";
import { AppError } from "@utils/app-error";

export async function registerPelanggan(data: RegisterDto): Promise<number> {
  const passwordHash = await bcrypt.hash(data.password, 10);

  return await authRepo.createPelanggan({
    nama: data.nama,
    email: data.email,
    passwordHash,
    telepon: data.telepon,
    alamat: data.alamat,
  });
}

export async function login(data: LoginDto): Promise<LoginResult> {
  const akun = await authRepo.findAkunByEmail(data.email);
  const passwordCocok = akun ? await bcrypt.compare(data.password, akun.password) : false;

  if (!akun || !passwordCocok) {
    throw new AppError("Email atau password salah", 401);
  }

  const token = jwt.sign({ id: akun.akun_id, role: akun.role }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });

  return {
    token,
    akun: { id: akun.akun_id, nama: akun.nama, role: akun.role },
  };
}

// View untuk controller auth.
export async function getDaftarAdmin(): Promise<DaftarAdmin[]> {
  return await authRepo.findDaftarAdmin();
}

export async function getDaftarPelanggan(): Promise<DaftarPelanggan[]> {
  return await authRepo.findDaftarPelanggan();
}
