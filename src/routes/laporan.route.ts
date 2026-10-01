import { Router } from "express";
import {
  getPenjualanBulanan,
  getAlatTerlaris,
  getLogAktivitas,
} from "@controllers/laporan.controller";
import { authenticate, requireRole } from "@middlewares/auth.middleware";

const router = Router();
router.use(authenticate, requireRole("admin"));

router.get("/penjualan-bulanan", getPenjualanBulanan);
router.get("/alat-terlaris", getAlatTerlaris);
router.get("/log-aktivitas", getLogAktivitas);

export default router;
