import express from "express";
import cors from "cors";
import type { NextFunction, Request, Response } from "express";
import "@config/env";

import authRouter from "@routes/auth.route";
import kategoriRouter from "@routes/kategori.route";
import alatRouter from "@routes/alat.route";
import stokRouter from "@routes/stok.route";
import pembelianRouter from "@routes/pembelian.route";
import laporanRouter from "@routes/laporan.route";
import { handleError } from "@utils/http";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/kategori", kategoriRouter);
app.use("/api/v1/alat-musik", alatRouter);
app.use("/api/v1/stok", stokRouter);
app.use("/api/v1/pembelian", pembelianRouter);
app.use("/api/v1/laporan", laporanRouter);

app.get("/", (_req, res) => {
  res.status(200).json({ status: "OK", message: "Toko Alat Musik API is running" });
});

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Endpoint tidak ditemukan" });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  handleError(res, err);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
