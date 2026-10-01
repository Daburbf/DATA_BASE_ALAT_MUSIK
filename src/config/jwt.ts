import { requireEnv } from "@config/env";

export const jwtSecret = requireEnv("JWT_SECRET");

if (jwtSecret.length < 16) {
  throw new Error("JWT_SECRET minimal 16 karakter");
}

export const jwtExpiresIn = "1d";
