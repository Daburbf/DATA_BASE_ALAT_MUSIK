import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { jwtSecret } from "@config/jwt";
import type { Role } from "@models/auth.model";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Token autentikasi tidak ditemukan" });
  }

  try {
    const payload = jwt.verify(header.slice(7), jwtSecret);

    if (
      typeof payload === "string" ||
      typeof payload.id !== "number" ||
      (payload.role !== "admin" && payload.role !== "pelanggan")
    ) {
      return res.status(401).json({ success: false, message: "Token tidak valid" });
    }

    req.user = { id: payload.id, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ success: false, message: "Token tidak valid atau sudah kedaluwarsa" });
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Anda tidak memiliki akses ke resource ini" });
    }

    return next();
  };
}
