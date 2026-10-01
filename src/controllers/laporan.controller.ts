import type { Request, Response } from "express";
import * as laporanService from "@services/laporan.service";
import { handleError } from "@utils/http";

export async function getPenjualanBulanan(req: Request, res: Response): Promise<Response> {
  try {
    const sekarang = new Date();
    const bulan = Number(req.query.bulan ?? sekarang.getMonth() + 1);
    const tahun = Number(req.query.tahun ?? sekarang.getFullYear());

    if (!Number.isInteger(bulan) || !Number.isInteger(tahun)) {
      return res.status(400).json({ success: false, message: "bulan dan tahun harus berupa angka bulat" });
    }

    const data = await laporanService.getPenjualanBulanan(bulan, tahun);
    return res.status(200).json({ success: true, data: { bulan, tahun, ...data } });
  } catch (err) {
    return handleError(res, err);
  }
}

export async function getAlatTerlaris(_req: Request, res: Response): Promise<Response> {
  try {
    const data = await laporanService.getAlatTerlaris();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return handleError(res, err);
  }
}

export async function getLogAktivitas(_req: Request, res: Response): Promise<Response> {
  try {
    const data = await laporanService.getLogAktivitas();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return handleError(res, err);
  }
}
