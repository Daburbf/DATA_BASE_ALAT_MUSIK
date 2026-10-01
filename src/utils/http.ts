import type { Response } from "express";
import { AppError } from "@utils/app-error";

interface DatabaseErrorLike {
  code: string;
  message: string;
  detail?: string;
}

// SQLSTATE TM4xx adalah kode kustom dari RAISE EXCEPTION di function/procedure.
const businessErrorStatus: Record<string, number> = {
  TM400: 400,
  TM403: 403,
  TM404: 404,
  TM409: 409,
};

function isDatabaseError(err: unknown): err is DatabaseErrorLike {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    typeof err.code === "string" &&
    "message" in err &&
    typeof err.message === "string"
  );
}

function translateDatabaseError(err: DatabaseErrorLike): AppError | null {
  const businessStatus = businessErrorStatus[err.code];
  if (businessStatus) {
    return new AppError(err.message, businessStatus);
  }

  switch (err.code) {
    case "23505":
      return new AppError("Data sudah terdaftar", 409);
    case "23503":
      return err.detail?.includes("is not present")
        ? new AppError("Data referensi tidak ditemukan", 400)
        : new AppError("Data masih digunakan oleh data lain", 409);
    case "23502":
    case "23514":
      return new AppError("Data tidak memenuhi aturan validasi", 400);
    case "22P02":
      return new AppError("Format data tidak valid", 400);
    case "22003":
      return new AppError("Nilai data di luar batas yang diizinkan", 400);
    default:
      return null;
  }
}

export function handleError(res: Response, err: unknown): Response {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  if (typeof err === "object" && err !== null && "type" in err) {
    if (err.type === "entity.parse.failed") {
      return res.status(400).json({ success: false, message: "Format JSON tidak valid" });
    }
    if (err.type === "entity.too.large") {
      return res.status(413).json({ success: false, message: "Ukuran request terlalu besar" });
    }
  }

  if (isDatabaseError(err)) {
    const translated = translateDatabaseError(err);
    if (translated) {
      return res.status(translated.statusCode).json({ success: false, message: translated.message });
    }
  }

  console.error(err);
  return res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
}

export function parseId(value: unknown): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function isPositiveInt(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

export function isNonEmptyString(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= maxLength;
}
