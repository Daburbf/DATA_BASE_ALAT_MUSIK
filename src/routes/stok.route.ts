import { Router } from "express";
import { getStok, tambahStok, tambahStokBatch, ubahStok } from "@controllers/stok.controller";
import { authenticate, requireRole } from "@middlewares/auth.middleware";

const router = Router();
router.use(authenticate, requireRole("admin"));

router.get("/", getStok);
router.post("/", tambahStok);
router.post("/batch", tambahStokBatch);
router.put("/:id", ubahStok);

export default router;
