import { Router } from "express";
import {
  getAlatTerlaris,
  getLogAktivitas,
  getPendapatanPerKategori,
  getPenjualanBulanan,
  getPenjualanPerBulan,
  getSemuaLogAktivitas,
} from "@controllers/laporan.controller";
import { authenticate, requireRole } from "@middlewares/auth.middleware";

const router = Router();
router.use(authenticate, requireRole("admin"));

router.get("/penjualan-bulanan", getPenjualanBulanan);
router.get("/penjualan-per-bulan", getPenjualanPerBulan);
router.get("/alat-terlaris", getAlatTerlaris);
router.get("/pendapatan-per-kategori", getPendapatanPerKategori);
router.get("/log-aktivitas", getLogAktivitas);
router.get("/log-aktivitas/semua", getSemuaLogAktivitas);

export default router;
