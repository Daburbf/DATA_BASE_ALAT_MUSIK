import type { Request, Response } from "express";
import * as authService from "@services/auth.service";
import { handleError, isNonEmptyString } from "@utils/http";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function register(req: Request, res: Response): Promise<Response> {
  try {
    const { nama, email, password, telepon, alamat } = req.body ?? {};

    if (!isNonEmptyString(nama, 100)) {
      return res.status(400).json({ success: false, message: "Nama wajib diisi (maksimal 100 karakter)" });
    }
    if (!isNonEmptyString(email, 255) || !emailPattern.test(email.trim())) {
      return res.status(400).json({ success: false, message: "Format email tidak valid" });
    }
    if (typeof password !== "string" || password.length < 8 || password.length > 72) {
      return res.status(400).json({ success: false, message: "Password wajib 8 sampai 72 karakter" });
    }
    if (telepon !== undefined && (typeof telepon !== "string" || telepon.length > 20)) {
      return res.status(400).json({ success: false, message: "Nomor telepon maksimal 20 karakter" });
    }
    if (alamat !== undefined && typeof alamat !== "string") {
      return res.status(400).json({ success: false, message: "Alamat harus berupa teks" });
    }

    const pelangganId = await authService.registerPelanggan({ nama, email, password, telepon, alamat });
    return res.status(201).json({
      success: true,
      message: "Registrasi berhasil",
      data: { id: pelangganId },
    });
  } catch (err) {
    return handleError(res, err);
  }
}

export async function login(req: Request, res: Response): Promise<Response> {
  try {
    const { email, password } = req.body ?? {};

    if (!isNonEmptyString(email, 255) || typeof password !== "string" || password === "") {
      return res.status(400).json({ success: false, message: "Email dan password wajib diisi" });
    }

    const result = await authService.login({ email, password });
    return res.status(200).json({ success: true, message: "Login berhasil", data: result });
  } catch (err) {
    return handleError(res, err);
  }
}

// GET /auth/admin — admin saja. Sumber: v_daftar_admin.
export async function getDaftarAdmin(_req: Request, res: Response): Promise<Response> {
  try {
    const data = await authService.getDaftarAdmin();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return handleError(res, err);
  }
}

// GET /auth/pelanggan — admin saja. Sumber: v_daftar_pelanggan.
export async function getDaftarPelanggan(_req: Request, res: Response): Promise<Response> {
  try {
    const data = await authService.getDaftarPelanggan();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return handleError(res, err);
  }
}
