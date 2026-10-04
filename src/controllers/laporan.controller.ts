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

// GET /laporan/pendapatan-per-kategori — admin. Sumber: v_pendapatan_per_kategori.
export async function getPendapatanPerKategori(_req: Request, res: Response): Promise<Response> {
  try {
    const data = await laporanService.getPendapatanPerKategori();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return handleError(res, err);
  }
}

// GET /laporan/penjualan-per-bulan?tahun= — admin. Sumber: v_penjualan_per_bulan.
export async function getPenjualanPerBulan(req: Request, res: Response): Promise<Response> {
  try {
    let tahun: number | undefined;

    if (req.query.tahun !== undefined) {
      const parsed = Number(req.query.tahun);
      if (!Number.isInteger(parsed)) {
        return res.status(400).json({ success: false, message: "tahun harus berupa angka bulat" });
      }
      tahun = parsed;
    }

    const data = await laporanService.getPenjualanPerBulan(tahun);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return handleError(res, err);
  }
}

// GET /laporan/log-aktivitas/semua?sumber=&limit= — admin.
// Sumber: v_log_aktivitas (tanpa LIMIT 100 seperti endpoint lama).
export async function getSemuaLogAktivitas(req: Request, res: Response): Promise<Response> {
  try {
    const { sumber, limit } = req.query;
    const batas = limit === undefined ? undefined : Number(limit);

    if (
      sumber !== undefined &&
      (typeof sumber !== "string" || sumber.trim() === "")
    ) {
      return res.status(400).json({ success: false, message: "sumber harus berupa teks" });
    }
    if (batas !== undefined && (!Number.isInteger(batas) || batas <= 0 || batas > 500)) {
      return res.status(400).json({ success: false, message: "limit harus 1 sampai 500" });
    }

    const data = await laporanService.getSemuaLogAktivitas(
      typeof sumber === "string" ? sumber : undefined,
      batas
    );
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return handleError(res, err);
  }
}
