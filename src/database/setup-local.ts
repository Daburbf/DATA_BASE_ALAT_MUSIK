/**
 * Setup database PostgreSQL lokal (tanpa Docker) untuk project toko-alat-musik.
 *
 * Cara pakai (satu kali saja):
 *   1. Isi file .env (DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET).
 *   2. Jalankan:  npm run db:setup   (atau:  npx tsx src/database/setup-local.ts)
 *
 * Yang dilakukan script ini (berurutan):
 *   a. Baca .env, deteksi instalasi PostgreSQL lokal (C:\Program Files\PostgreSQL\*\bin\psql.exe).
 *   b. Minta password superuser "postgres" lewat prompt terminal (tidak disimpan di mana pun).
 *   c. Buat ROLE toko_user (atau DB_USER) + DATABASE toko_alat_musik (atau DB_NAME) bila belum ada.
 *   d. Aktifkan ekstensi pgcrypto di database target (dibutuhkan seed password admin).
 *   e. Jalankan ulang perintah `npm run migrate` di dalam script ini, lalu verifikasi
 *      koneksi sebagai DB_USER + hitung jumlah tabel hasil migrasi.
 *
 * Keamanan: password superuser hanya dipakai di memori proses ini via env PGPASSWORD
 * dan TIDAK pernah ditulis ke file, log, maupun git.
 */
import { spawnSync } from "child_process";
import { createInterface } from "readline";
import { existsSync, readdirSync } from "fs";
import path from "path";
import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config();

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = Number(process.env.DB_PORT) || 5432;
const DB_USER = process.env.DB_USER || "toko_user";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_NAME = process.env.DB_NAME || "toko_alat_musik";

function fail(message: string): never {
  console.error(`\n[db:setup] GAGAL: ${message}`);
  process.exit(1);
}

function findPsql(): string {
  const candidates: string[] = [];
  const base = "C:\\Program Files\\PostgreSQL";
  if (existsSync(base)) {
    for (const entry of readdirSync(base)) {
      const p = path.join(base, entry, "bin", "psql.exe");
      if (existsSync(p)) candidates.push(p);
    }
  }
  const fromPath = spawnSync("where", ["psql.exe"], { encoding: "utf-8" });
  if (fromPath.status === 0) {
    for (const line of fromPath.stdout.split(/\r?\n/)) {
      const p = line.trim();
      if (p && existsSync(p)) candidates.push(p);
    }
  }
  if (candidates.length === 0) {
    fail(
      "psql.exe tidak ditemukan. Install PostgreSQL 16+ untuk Windows dari https://www.postgresql.org/download/windows/ " +
        "lalu jalankan lagi script ini."
    );
  }
  // Versi paling baru dulu (nama folder = angka versi).
  candidates.sort().reverse();
  return candidates[0] as string;
}

function askHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const stdin = process.stdin;
    const onData = (ch: Buffer) => {
      const s = ch.toString();
      if (s === "\r" || s === "\n") process.stdout.write("\n");
    };
    // Sembunyikan ketikan (best-effort di Windows).
    if (stdin.isTTY) {
      try {
        (stdin as unknown as { setRawMode: (m: boolean) => void }).setRawMode(true);
      } catch {
        /* abaikan */
      }
    }
    stdin.on("data", onData);
    rl.question(question, (answer) => {
      stdin.removeListener("data", onData);
      if (stdin.isTTY) {
        try {
          (stdin as unknown as { setRawMode: (m: boolean) => void }).setRawMode(false);
        } catch {
          /* abaikan */
        }
      }
      rl.close();
      resolve(answer.trim());
    });
  });
}

/** Jalankan satu perintah SQL via psql sebagai superuser. Return true bila sukses. */
function psqlAsSuperuser(psql: string, superPassword: string, db: string, sql: string): boolean {
  const r = spawnSync(psql, ["-h", DB_HOST, "-p", String(DB_PORT), "-U", "postgres", "-d", db, "-v", "ON_ERROR_STOP=1", "-c", sql], {
    encoding: "utf-8",
    env: { ...process.env, PGPASSWORD: superPassword },
  });
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout);
    return false;
  }
  return true;
}

function escapeLiteral(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function escapeIdent(value: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) {
    fail(`Nama DB_USER/DB_NAME tidak valid: ${value} (hanya huruf, angka, underscore)`);
  }
  return `"${value.replace(/"/g, '""')}"`;
}

async function main(): Promise<void> {
  if (!DB_PASSWORD || DB_PASSWORD === "ganti_password_ini") {
    fail("Isi dulu DB_PASSWORD di file .env (jangan pakai nilai contoh).");
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
    fail("Isi dulu JWT_SECRET di file .env (minimal 16 karakter).");
  }

  const psql = findPsql();
  console.log(`[db:setup] psql: ${psql}`);
  console.log(`[db:setup] target: ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);

  const superPassword = await askHidden("Password superuser postgres lokal (tidak ditampilkan): ");
  if (!superPassword) fail("Password superuser wajib diisi.");

  // 1. Tes koneksi superuser.
  console.log("[db:setup] (1/5) cek koneksi superuser...");
  if (!psqlAsSuperuser(psql, superPassword, "postgres", "SELECT 1;")) {
    fail('Login superuser "postgres" gagal. Cek lagi password yang dimasukkan saat install PostgreSQL.');
  }

  // 2. Buat role aplikasi bila belum ada.
  console.log("[db:setup] (2/5) siapkan role aplikasi...");
  const mkRole = `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = ${escapeLiteral(DB_USER)}) THEN ` +
    `CREATE ROLE ${escapeIdent(DB_USER)} LOGIN PASSWORD ${escapeLiteral(DB_PASSWORD)}; ` +
    `ELSE ALTER ROLE ${escapeIdent(DB_USER)} LOGIN PASSWORD ${escapeLiteral(DB_PASSWORD)}; END IF; END $$;`;
  if (!psqlAsSuperuser(psql, superPassword, "postgres", mkRole)) fail("Gagal membuat role aplikasi.");

  // 3. Buat database bila belum ada + set owner.
  console.log("[db:setup] (3/5) siapkan database...");
  const mkDb =
    `SELECT 'CREATE DATABASE ${escapeIdent(DB_NAME)} OWNER ${escapeIdent(DB_USER)}' ` +
    `WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = ${escapeLiteral(DB_NAME)})\\gexec`;
  if (!psqlAsSuperuser(psql, superPassword, "postgres", mkDb)) fail("Gagal membuat database.");
  if (!psqlAsSuperuser(psql, superPassword, "postgres", `ALTER DATABASE ${escapeIdent(DB_NAME)} OWNER TO ${escapeIdent(DB_USER)};`)) {
    fail("Gagal set owner database.");
  }

  // 4. Aktifkan pgcrypto (dibutuhkan seed: crypt/gen_salt).
  console.log("[db:setup] (4/5) aktifkan ekstensi pgcrypto...");
  if (!psqlAsSuperuser(psql, superPassword, DB_NAME, `CREATE EXTENSION IF NOT EXISTS pgcrypto;`)) {
    fail("Gagal mengaktifkan pgcrypto.");
  }

  // 5. Migrasi via kode yang sudah ada + verifikasi koneksi sebagai DB_USER.
  console.log("[db:setup] (5/5) jalankan migrasi (npm run migrate)...");
  const migrate = spawnSync("npm", ["run", "migrate"], { shell: true, stdio: "inherit" });
  if (migrate.status !== 0) fail("Migrasi gagal — lihat log di atas.");

  console.log("[db:setup] verifikasi koneksi sebagai DB_USER...");
  const client = new Client({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  });
  await client.connect();
  const tables = await client.query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'"
  );
  const views = await client.query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM information_schema.views WHERE table_schema = 'public'"
  );
  await client.end();

  console.log(`\n[db:setup] BERHASIL — tabel: ${tables.rows[0]?.count}, view: ${views.rows[0]?.count}.`);
  console.log("[db:setup] Jalankan API: npm run dev  →  http://localhost:3000/");
}

main().catch((err) => {
  console.error("\n[db:setup] GAGAL:", err);
  process.exit(1);
});
