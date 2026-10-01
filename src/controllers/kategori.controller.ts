import type { Request, Response } from "express";
import * as kategoriService from "@services/kategori.service";
import { handleError, isNonEmptyString, parseId } from "@utils/http";

export async function getKategori(_req: Request, res: Response): Promise<Response> {
  try {
    const data = await kategoriService.getAllKategori();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return handleError(res, err);
  }
}

export async function createKategori(req: Request, res: Response): Promise<Response> {
  try {
    const { nama_kategori, deskripsi } = req.body ?? {};

    if (!isNonEmptyString(nama_kategori, 100)) {
      return res.status(400).json({ success: false, message: "Nama kategori wajib diisi (maksimal 100 karakter)" });
    }
    if (deskripsi !== undefined && typeof deskripsi !== "string") {
      return res.status(400).json({ success: false, message: "Deskripsi harus berupa teks" });
    }

    const data = await kategoriService.createKategori({ nama_kategori, deskripsi });
    return res.status(201).json({ success: true, message: "Kategori berhasil ditambahkan", data });
  } catch (err) {
    return handleError(res, err);
  }
}

export async function updateKategori(req: Request, res: Response): Promise<Response> {
  try {
    const id = parseId(req.params.id);
    const { nama_kategori, deskripsi } = req.body ?? {};

    if (id === null) {
      return res.status(400).json({ success: false, message: "ID kategori tidak valid" });
    }
    if (!isNonEmptyString(nama_kategori, 100)) {
      return res.status(400).json({ success: false, message: "Nama kategori wajib diisi (maksimal 100 karakter)" });
    }
    if (deskripsi !== undefined && typeof deskripsi !== "string") {
      return res.status(400).json({ success: false, message: "Deskripsi harus berupa teks" });
    }

    const data = await kategoriService.updateKategori(id, { nama_kategori, deskripsi });
    return res.status(200).json({ success: true, message: "Kategori berhasil diubah", data });
  } catch (err) {
    return handleError(res, err);
  }
}

export async function deleteKategori(req: Request, res: Response): Promise<Response> {
  try {
    const id = parseId(req.params.id);

    if (id === null) {
      return res.status(400).json({ success: false, message: "ID kategori tidak valid" });
    }

    await kategoriService.deleteKategori(id);
    return res.status(200).json({ success: true, message: "Kategori berhasil dihapus" });
  } catch (err) {
    return handleError(res, err);
  }
}
