import type { Request, Response } from "express";
import type { StatusPembelian } from "@models/pembelian.model";
import * as pembelianService from "@services/pembelian.service";
import { handleError, isPositiveInt, parseId } from "@utils/http";

const itemMaksimal = 50;
const statusValid: StatusPembelian[] = ["diproses", "dikirim", "selesai", "dibatalkan"];

export async function checkoutPembelian(req: Request, res: Response): Promise<Response> {
  try {
    const { barang } = req.body ?? {};

    if (!Array.isArray(barang) || barang.length === 0 || barang.length > itemMaksimal) {
      return res.status(400).json({
        success: false,
        message: `barang wajib berupa array berisi 1 sampai ${itemMaksimal} item`,
      });
    }

    for (const item of barang) {
      if (!item || !isPositiveInt(item.alat_id) || !isPositiveInt(item.jumlah)) {
        return res.status(400).json({
          success: false,
          message: "Setiap barang wajib memiliki alat_id dan jumlah berupa angka bulat positif",
        });
      }
    }

    const data = await pembelianService.checkout(
      req.user!.id,
      barang.map((item) => ({ alat_id: item.alat_id, jumlah: item.jumlah }))
    );
    return res.status(201).json({ success: true, message: "Pembelian berhasil dibuat", data });
  } catch (err) {
    return handleError(res, err);
  }
}

export async function getRiwayatPembelian(req: Request, res: Response): Promise<Response> {
  try {
    const data = await pembelianService.getRiwayat(req.user!.id, req.user!.role);
    return res.status(200).json({ success: true, message: "Riwayat pembelian", data });
  } catch (err) {
    return handleError(res, err);
  }
}

export async function ubahStatusPembelian(req: Request, res: Response): Promise<Response> {
  try {
    const pembelianId = parseId(req.params.id);
    const { status_pembelian } = req.body ?? {};

    if (pembelianId === null) {
      return res.status(400).json({ success: false, message: "ID pembelian tidak valid" });
    }
    if (!statusValid.includes(status_pembelian)) {
      return res.status(400).json({
        success: false,
        message: `status_pembelian harus salah satu dari: ${statusValid.join(", ")}`,
      });
    }

    await pembelianService.changeStatus(
      pembelianId,
      status_pembelian,
      req.user!.id,
      req.user!.role
    );
    return res.status(200).json({
      success: true,
      message: `Status pembelian diubah menjadi ${status_pembelian}`,
    });
  } catch (err) {
    return handleError(res, err);
  }
}
