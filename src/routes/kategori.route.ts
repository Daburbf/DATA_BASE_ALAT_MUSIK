import { Router } from "express";
import {
  createKategori,
  deleteKategori,
  getDaftarKategori,
  getKategori,
  updateKategori,
} from "@controllers/kategori.controller";
import { authenticate, requireRole } from "@middlewares/auth.middleware";

const router = Router();
router.get("/", getKategori);
router.get("/daftar", getDaftarKategori);
router.post("/", authenticate, requireRole("admin"), createKategori);
router.put("/:id", authenticate, requireRole("admin"), updateKategori);
router.delete("/:id", authenticate, requireRole("admin"), deleteKategori);

export default router;
