import type { Request, Response } from "express";
import * as stokService from "@services/stok.service";
import { handleError, isPositiveInt, parseId } from "@utils/http";

const batchMaksimal = 100;

export async function getStok(_req: Request, res: Response): Promise<Response> {
  try {
    const data = await stokService.getAllStok();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return handleError(res, err);
  }
}

//stok
export async function getRingkasanStok(_req: Request, res: Response): Promise<Response> {
  try {
    const data = await stokService.getRingkasanStok();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return handleError(res, err);
  }
}

export async function tambahStok(req: Request, res: Response): Promise<Response> {
  try {
    const { alat_id, jumlah } = req.body ?? {};

    if (!isPositiveInt(alat_id)) {
      return res.status(400).json({ success: false, message: "alat_id wajib berupa angka bulat positif" });
    }
    if (!isPositiveInt(jumlah)) {
      return res.status(400).json({ success: false, message: "jumlah wajib berupa angka bulat lebih dari 0" });
    }

    await stokService.addStok({ alat_id, jumlah }, req.user!.id);
    return res.status(200).json({ success: true, message: "Stok berhasil ditambahkan" });
  } catch (err) {
    return handleError(res, err);
  }
}

export async function tambahStokBatch(req: Request, res: Response): Promise<Response> {
  try {
    const { items } = req.body ?? {};

    if (!Array.isArray(items) || items.length === 0 || items.length > batchMaksimal) {
      return res.status(400).json({
        success: false,
        message: `items wajib berupa array berisi 1 sampai ${batchMaksimal} data`,
      });
    }

    for (const item of items) {
      if (!item || !isPositiveInt(item.alat_id) || !isPositiveInt(item.jumlah)) {
        return res.status(400).json({
          success: false,
          message: "Setiap item wajib memiliki alat_id dan jumlah berupa angka bulat positif",
        });
      }
    }

    await stokService.addStokBatch(
      items.map((item) => ({ alat_id: item.alat_id, jumlah: item.jumlah })),
      req.user!.id
    );
    return res.status(200).json({ success: true, message: "Stok semua item berhasil ditambahkan" });
  } catch (err) {
    return handleError(res, err);
  }
}

export async function ubahStok(req: Request, res: Response): Promise<Response> {
  try {
    const stokId = parseId(req.params.id);
    const { jumlah } = req.body ?? {};

    if (stokId === null) {
      return res.status(400).json({ success: false, message: "ID stok tidak valid" });
    }
    if (typeof jumlah !== "number" || !Number.isInteger(jumlah) || jumlah < 0) {
      return res.status(400).json({ success: false, message: "jumlah wajib berupa angka bulat 0 atau lebih" });
    }

    await stokService.updateStok(stokId, jumlah, req.user!.id);
    return res.status(200).json({ success: true, message: "Stok berhasil diubah" });
  } catch (err) {
    return handleError(res, err);
  }
}
