import { Router } from "express";
import {
  deleteAkunSendiri,
  deletePelanggan,
  getDaftarAdmin,
  getDaftarPelanggan,
  login,
  register,
} from "@controllers/auth.controller";
import { authenticate, requireRole } from "@middlewares/auth.middleware";

const router = Router();
router.post("/register", register);
router.post("/login", login);
router.delete("/me", authenticate, requireRole("pelanggan"), deleteAkunSendiri);
router.delete("/pelanggan/:id", authenticate, requireRole("admin"), deletePelanggan);
router.get("/admin", authenticate, requireRole("admin"), getDaftarAdmin);
router.get("/pelanggan", authenticate, requireRole("admin"), getDaftarPelanggan);

export default router;
