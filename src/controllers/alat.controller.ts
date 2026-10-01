import type { Request, Response } from "express";
import * as alatService from "@services/alat.service";
import { handleError, isNonEmptyString, parseId } from "@utils/http";

const hargaMaksimal = 9999999999.99;

function validateAlatBody(body: any): string | null {
  const { kategori_id, nama_alat, deskripsi, harga } = body ?? {};

  if (!isNonEmptyString(nama_alat, 150)) {
    return "Nama alat wajib diisi (maksimal 150 karakter)";
  }
  if (typeof harga !== "number" || !Number.isFinite(harga) || harga <= 0 || harga > hargaMaksimal) {
    return "Harga wajib berupa angka lebih dari 0 dan maksimal 9999999999.99";
  }
  if (kategori_id !== undefined && kategori_id !== null && parseId(kategori_id) === null) {
    return "ID kategori harus berupa angka";
  }
  if (deskripsi !== undefined && typeof deskripsi !== "string") {
    return "Deskripsi harus berupa teks";
  }

  return null;
}

export async function getAlat(req: Request, res: Response): Promise<Response> {
  try {
    let kategoriId: number | undefined;

    if (req.query.kategori_id !== undefined) {
      const parsed = parseId(req.query.kategori_id);
      if (parsed === null) {
        return res.status(400).json({ success: false, message: "kategori_id harus berupa angka" });
      }
      kategoriId = parsed;
    }

    const data = await alatService.getKatalogAlat(kategoriId);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return handleError(res, err);
  }
}

export async function getAlatById(req: Request, res: Response): Promise<Response> {
  try {
    const id = parseId(req.params.id);

    if (id === null) {
      return res.status(400).json({ success: false, message: "ID alat musik tidak valid" });
    }

    const data = await alatService.getDetailAlat(id);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return handleError(res, err);
  }
}

export async function createAlat(req: Request, res: Response): Promise<Response> {
  try {
    const invalid = validateAlatBody(req.body);
    if (invalid) {
      return res.status(400).json({ success: false, message: invalid });
    }

    const { kategori_id, nama_alat, deskripsi, harga } = req.body;
    const id = await alatService.createAlat({ kategori_id, nama_alat, deskripsi, harga });

    return res.status(201).json({
      success: true,
      message: "Alat musik berhasil ditambahkan",
      data: { id },
    });
  } catch (err) {
    return handleError(res, err);
  }
}

export async function updateAlat(req: Request, res: Response): Promise<Response> {
  try {
    const id = parseId(req.params.id);

    if (id === null) {
      return res.status(400).json({ success: false, message: "ID alat musik tidak valid" });
    }

    const invalid = validateAlatBody(req.body);
    if (invalid) {
      return res.status(400).json({ success: false, message: invalid });
    }

    const { kategori_id, nama_alat, deskripsi, harga } = req.body;
    await alatService.updateAlat(id, { kategori_id, nama_alat, deskripsi, harga });

    return res.status(200).json({ success: true, message: "Alat musik berhasil diubah" });
  } catch (err) {
    return handleError(res, err);
  }
}

export async function deleteAlat(req: Request, res: Response): Promise<Response> {
  try {
    const id = parseId(req.params.id);

    if (id === null) {
      return res.status(400).json({ success: false, message: "ID alat musik tidak valid" });
    }

    await alatService.deleteAlat(id);
    return res.status(200).json({ success: true, message: "Alat musik berhasil dihapus" });
  } catch (err) {
    return handleError(res, err);
  }
}
