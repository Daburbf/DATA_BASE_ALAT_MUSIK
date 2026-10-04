import { Router } from "express";
import {
  getDaftarAdmin,
  getDaftarPelanggan,
  login,
  register,
} from "@controllers/auth.controller";
import { authenticate, requireRole } from "@middlewares/auth.middleware";

const router = Router();
router.post("/register", register);
router.post("/login", login);
router.get("/admin", authenticate, requireRole("admin"), getDaftarAdmin);
router.get("/pelanggan", authenticate, requireRole("admin"), getDaftarPelanggan);

export default router;
