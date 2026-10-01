import { Router } from "express";
import {
  getAlat,
  getAlatById,
  createAlat,
  updateAlat,
  deleteAlat,
} from "@controllers/alat.controller";
import { authenticate, requireRole } from "@middlewares/auth.middleware";

const router = Router();
router.get("/", getAlat);
router.get("/:id", getAlatById);
router.post("/", authenticate, requireRole("admin"), createAlat);
router.put("/:id", authenticate, requireRole("admin"), updateAlat);
router.delete("/:id", authenticate, requireRole("admin"), deleteAlat);

export default router;
