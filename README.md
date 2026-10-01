# toko-alat-musik

REST API toko alat musik. Stack: Bun, TypeScript, Express 5, PostgreSQL 16.

Logika bisnis (validasi stok, perhitungan total, perubahan status, audit) dijalankan di database lewat function, procedure, trigger, dan view. Lapisan aplikasi hanya memvalidasi input, memanggil objek database tersebut, dan memetakan error ke respons HTTP.

## Prasyarat

- [Bun](https://bun.sh) 1.1 atau lebih baru
- [Docker](https://docs.docker.com/get-docker/) dengan Docker Compose v2 (perintah `docker compose`)

Instal Bun:

```bash
# Linux / macOS
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"
```

## Menjalankan Project

### 1. Siapkan environment

```bash
cp .env.example .env        # Windows (cmd): copy .env.example .env
```

Buka `.env`, lalu ubah `DB_PASSWORD` dan `JWT_SECRET`. `JWT_SECRET` minimal 16 karakter. File `.env` dibaca oleh Docker Compose dan oleh aplikasi, jadi nilainya harus diisi sebelum langkah berikutnya.

### 2. Jalankan PostgreSQL dengan Docker CLI

```bash
docker compose up -d
```

Perintah ini mengunduh image, membuat container `toko_postgres` (database) dan `toko_adminer` (GUI database), lalu menjalankannya di latar belakang.

Pastikan database sudah siap:

```bash
docker compose ps
```

Kolom `STATUS` pada `toko_postgres` harus `Up ... (healthy)`. Jika masih `(health: starting)`, tunggu beberapa detik lalu ulangi.

Jika `docker compose` tidak dikenali, Docker Anda memakai Compose versi lama. Ganti dengan `docker-compose`.

### 3. Instal dependency

```bash
bun install
```

### 4. Jalankan migrasi

```bash
bun run migrate
```

Migrasi membuat tabel, function, procedure, trigger, view, data awal, dan role database. Setiap file dijalankan dalam satu transaksi dan dicatat di tabel `schema_migrations`, jadi menjalankan perintah ini berulang kali aman: file yang sudah diterapkan dilewati.

### 5. Jalankan server

```bash
bun run dev
```

Server berjalan di `http://localhost:3000`. Cek dengan:

```bash
curl http://localhost:3000/
```

Akun admin bawaan dari seed: `admin@tokomusik.com` dengan password `admin123`. Ganti password ini sebelum dipakai di luar lingkungan lokal.

## Perintah Docker yang Sering Dipakai

| Tujuan | Perintah |
| --- | --- |
| Melihat log database | `docker compose logs -f postgres` |
| Masuk ke psql | `docker exec -it toko_postgres psql -U toko_user -d toko_alat_musik` |
| Menghentikan container (data tetap) | `docker compose stop` |
| Menyalakan lagi | `docker compose start` |
| Menghapus container (data tetap di volume) | `docker compose down` |
| Menghapus container dan seluruh data | `docker compose down -v` |

Ganti `toko_user` dan `toko_alat_musik` jika Anda mengubah `DB_USER` atau `DB_NAME` di `.env`.

Mengulang dari database kosong:

```bash
docker compose down -v
docker compose up -d
bun run migrate
```

Adminer tersedia di `http://localhost:8080`. Isi form login: System `PostgreSQL`, Server `postgres`, serta Username, Password, dan Database sesuai `.env`.

### Alternatif: docker run tanpa Compose

Jika hanya membutuhkan database:

```bash
docker run -d --name toko_postgres \
  -e POSTGRES_USER=toko_user \
  -e POSTGRES_PASSWORD=ganti_password_ini \
  -e POSTGRES_DB=toko_alat_musik \
  -p 5432:5432 \
  -v toko_postgres_data:/var/lib/postgresql/data \
  postgres:16-alpine
```

Nilai user, password, dan database harus sama dengan `DB_USER`, `DB_PASSWORD`, dan `DB_NAME` di `.env`.

### Masalah umum

- **`port is already allocated` pada 5432**: ada PostgreSQL lain yang memakai port itu. Ubah `DB_PORT` di `.env` (misalnya `5433`), lalu jalankan ulang `docker compose up -d`.
- **`password authentication failed`**: volume lama masih menyimpan password sebelumnya. Jalankan `docker compose down -v`, lalu ulangi dari langkah 2.
- **`Environment variable DB_USER wajib diisi`**: file `.env` belum dibuat atau belum lengkap.

## Struktur Project

```
src/
  config/         koneksi database, env, JWT
  controllers/    validasi input dan respons HTTP
  database/
    migrate.ts    runner migrasi
    migrations/   file SQL: schema, function, procedure, trigger, view, seed, privilege
  middlewares/    autentikasi JWT dan pembatasan role
  models/         tipe data (DTO dan hasil query)
  repositories/   pemanggilan query, view, function, dan procedure
  routes/         definisi endpoint
  services/       logika aplikasi (hash password, token, aturan per role)
  utils/          penanganan error
  index.ts        entry point
```

Alur request: `route` → `controller` → `service` → `repository` → database.

## Konsep Database yang Diterapkan

| Konsep | Objek | File |
| --- | --- | --- |
| Function | `fn_ambil_akun_login`, `fn_hitung_subtotal`, `fn_laporan_penjualan_bulanan` | `create_auth_procedure_function`, `create_pembelian_procedure_function` |
| Procedure | `sp_registrasi_pelanggan`, `sp_tambah_stok`, `sp_ubah_stok`, `sp_checkout_pembelian`, `sp_ubah_status_pembelian` | `create_auth_...`, `create_stok_...`, `create_pembelian_...` |
| Trigger | `trg_buat_stok_awal`, `trg_cegah_hapus_alat_terjual`, `trg_audit_stok`, `trg_log_pembelian`, `trg_log_status_pembelian`, `trg_kembalikan_stok` | `create_toko_triggers` |
| View | `v_katalog_alat`, `v_stok_alat`, `v_riwayat_pembelian`, `v_alat_terlaris`, `v_log_aktivitas_terbaru` | `create_toko_views` |
| Transaction | Setiap procedure berjalan atomik. `sp_checkout_pembelian` mengunci baris stok (`FOR UPDATE`) dan membatalkan semuanya jika satu item gagal. Penambahan stok massal memakai transaksi di sisi aplikasi (`withTransaction`). Migrasi per file juga satu transaksi. | `config/db.ts`, `stok.repository.ts`, `migrate.ts` |
| Index | `idx_alat_kategori`, `idx_pembelian_pelanggan`, `idx_pembelian_status_tanggal`, `idx_detail_pembelian_alat` | `create_toko_schema` |
| Constraint | `CHECK` (harga, stok, status), `UNIQUE`, `FOREIGN KEY` dengan aksi `ON DELETE` | `create_toko_schema` |
| Role dan privilege | `pelanggan_role` (baca katalog, panggil procedure pembelian), `admin_role` (akses penuh). `PUBLIC` dicabut dari seluruh routine. | `create_toko_privileges` |

Catatan role: aplikasi terhubung memakai user dari `.env` (pemilik database), sehingga role di atas berfungsi sebagai definisi hak akses di level database dan dapat dipakai jika koneksi dipisah per role. Procedure yang diberikan ke `pelanggan_role` memakai `SECURITY DEFINER` agar tetap berjalan tanpa memberi akses langsung ke tabel.

Kode error kustom dari `RAISE EXCEPTION` dipetakan ke status HTTP oleh `utils/http.ts`: `TM400` → 400, `TM403` → 403, `TM404` → 404, `TM409` → 409.

## Endpoint

Prefix: `/api/v1`. Autentikasi memakai header `Authorization: Bearer <token>` dari endpoint login. Format respons: `{ "success": boolean, "message"?: string, "data"?: any }`.

| Method | Path | Akses | Keterangan |
| --- | --- | --- | --- |
| POST | `/auth/register` | Publik | Daftar pelanggan |
| POST | `/auth/login` | Publik | Login admin atau pelanggan |
| GET | `/kategori` | Publik | Daftar kategori |
| POST | `/kategori` | Admin | Tambah kategori |
| PUT | `/kategori/:id` | Admin | Ubah kategori |
| DELETE | `/kategori/:id` | Admin | Hapus kategori |
| GET | `/alat-musik` | Publik | Katalog beserta stok. Filter: `?kategori_id=` |
| GET | `/alat-musik/:id` | Publik | Detail alat musik |
| POST | `/alat-musik` | Admin | Tambah alat musik (stok awal 0 dibuat otomatis) |
| PUT | `/alat-musik/:id` | Admin | Ubah alat musik |
| DELETE | `/alat-musik/:id` | Admin | Hapus alat musik |
| GET | `/stok` | Admin | Daftar stok |
| POST | `/stok` | Admin | Tambah stok satu alat |
| POST | `/stok/batch` | Admin | Tambah stok banyak alat (semua berhasil atau tidak sama sekali) |
| PUT | `/stok/:id` | Admin | Set jumlah stok (`id` adalah `stok_id`) |
| POST | `/pembelian` | Pelanggan | Checkout |
| GET | `/pembelian` | Login | Pelanggan: riwayat sendiri. Admin: semua pembelian |
| PATCH | `/pembelian/:id/status` | Login | Ubah status (lihat aturan di bawah) |
| GET | `/laporan/penjualan-bulanan` | Admin | Query: `?bulan=10&tahun=2026` (default bulan berjalan) |
| GET | `/laporan/alat-terlaris` | Admin | Alat musik terlaris |
| GET | `/laporan/log-aktivitas` | Admin | 100 log aktivitas terbaru |

### Aturan status pembelian

Alur: `pending` → `diproses` → `dikirim` → `selesai`. Pembelian dapat dibatalkan (`dibatalkan`) dari `pending` atau `diproses`. Status `selesai` dan `dibatalkan` bersifat final. Saat dibatalkan, stok dikembalikan otomatis oleh trigger `trg_kembalikan_stok`.

- Admin dapat melakukan semua transisi yang valid.
- Pelanggan hanya dapat mengubah pembelian miliknya menjadi `selesai` atau `dibatalkan`.

Laporan penjualan dan alat terlaris hanya menghitung pembelian berstatus `selesai`.

### Contoh penggunaan

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nama":"Siti","email":"siti@mail.com","password":"rahasia123"}'

# Login (salin nilai data.token dari respons)
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"siti@mail.com","password":"rahasia123"}'

# Lihat katalog
curl http://localhost:3000/api/v1/alat-musik

# Checkout
curl -X POST http://localhost:3000/api/v1/pembelian \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"barang":[{"alat_id":1,"jumlah":2},{"alat_id":3,"jumlah":1}]}'

# Batalkan pembelian
curl -X PATCH http://localhost:3000/api/v1/pembelian/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"status_pembelian":"dibatalkan"}'
```

Contoh body lain:

```json
// POST /stok
{ "alat_id": 1, "jumlah": 10 }

// POST /stok/batch
{ "items": [{ "alat_id": 1, "jumlah": 5 }, { "alat_id": 2, "jumlah": 3 }] }

// POST /alat-musik
{ "kategori_id": 1, "nama_alat": "Gitar Klasik", "deskripsi": "Senar nilon", "harga": 1250000 }
```

## Script

| Perintah | Fungsi |
| --- | --- |
| `bun run dev` | Menjalankan server dengan auto-reload |
| `bun run start` | Menjalankan server tanpa auto-reload |
| `bun run migrate` | Menjalankan migrasi database |
| `bun run typecheck` | Memeriksa tipe TypeScript |
