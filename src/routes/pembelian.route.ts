import { Router } from "express";
import {
  checkoutPembelian,
  getRiwayatPembelian,
  ubahStatusPembelian,
} from "@controllers/pembelian.controller";
import { authenticate, requireRole } from "@middlewares/auth.middleware";

const router = Router();
router.use(authenticate);

router.post("/", requireRole("pelanggan"), checkoutPembelian);
router.get("/", getRiwayatPembelian);
router.patch("/:id/status", ubahStatusPembelian);

export default router;
