import { Router } from "express";
import {
  checkoutPembelian,
  getDaftarPembelian,
  getDetailPembelian,
  getRiwayatPembelian,
  ubahStatusPembelian,
} from "@controllers/pembelian.controller";
import { authenticate, requireRole } from "@middlewares/auth.middleware";

const router = Router();
router.use(authenticate);

router.post("/", requireRole("pelanggan"), checkoutPembelian);
router.get("/", getRiwayatPembelian);
router.get("/daftar", getDaftarPembelian);
router.get("/detail", getDetailPembelian);
router.patch("/:id/status", ubahStatusPembelian);

export default router;
