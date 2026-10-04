# toko-alat-musik

REST API toko alat musik. Stack: Node.js + TypeScript (tsx), Express 5, PostgreSQL lokal (tanpa Docker).

Logika bisnis (validasi stok, perhitungan total, perubahan status, audit) dijalankan di database lewat function, procedure, trigger, dan view. Lapisan aplikasi hanya memvalidasi input, memanggil objek database tersebut, dan memetakan error ke respons HTTP.

## Prasyarat

- [Node.js](https://nodejs.org) 20 atau lebih baru (sudah termasuk `npm`)
- [PostgreSQL](https://www.postgresql.org/download/windows/) 16 atau lebih baru untuk Windows, **service-nya berjalan** (cek di `services.msc` → `postgresql-x64-18` = Running)
- [VS Code](https://code.visualstudio.com/) + extension **SQLTools** dan **SQLTools PostgreSQL driver** (sudah direkomendasikan di `.vscode/extensions.json`)

Tidak butuh Docker, tidak butuh Bun. Semua perintah di bawah memakai `npm`.

## Menjalankan Project (VS Code + PostgreSQL lokal)

### 1. Buka project di VS Code

```cmd
code "C:\Users\TUF GAMING\Downloads\toko-alat-musik"
```

Install extension yang disarankan saat VS Code menawarkannya (atau manual: `mtxr.sqltools` + `mtxr.sqltools-driver-pg`).

### 2. Siapkan environment

```cmd
copy .env.example .env
```

Buka `.env`, lalu ubah `DB_PASSWORD` (password untuk user `toko_user` yang akan dibuat otomatis) dan `JWT_SECRET` (minimal 16 karakter).

### 3. Setup database lokal (satu kali saja)

```cmd
npm install
npm run db:setup
```

Script ini memakai kode yang sudah ada — tidak mengubah cara aplikasi konek (`src/config/db.ts` tetap baca `DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME` dari `.env`). Yang dilakukan:

1. Deteksi `psql.exe` instalasi PostgreSQL lokal.
2. Minta password superuser `postgres` (diketik di terminal, tidak disimpan).
3. Buat role `toko_user` + database `toko_alat_musik` (sesuai `.env`) bila belum ada.
4. Aktifkan ekstensi `pgcrypto`.
5. Menjalankan `npm run migrate` (tabel, function, procedure, trigger, view, seed, privilege) lalu verifikasi koneksi.

Cek koneksi kapan saja tanpa migrasi ulang:

```cmd
npm run db:ping
```

### 4. Jalankan server

```cmd
npm run dev
```

Server berjalan di `http://localhost:3000`. Cek dengan membuka `http://localhost:3000/` di browser.

Akun admin bawaan dari seed: `admin@tokomusik.com` dengan password `admin123`. Ganti password ini sebelum dipakai di luar lingkungan lokal.

## Testing API — Wajib Postman (VS Code Extension, Tanpa Postman Desktop)

Project ini **wajib memakai Postman**, dan dijalankan **langsung dari VS Code** lewat extension resmi — **tidak ada Postman desktop, tidak ada Bruno, tidak ada curl sebagai cara utama**. Semua endpoint sudah tersedia sebagai koleksi siap import.

File yang dipakai:

```
toko-alat-musik-api/
  toko-alat-musik-api.postman_collection.json       koleksi (6 folder: Auth, Kategori, Alat Musik, Stok, Pembelian, Laporan)
  toko-alat-musik-local.postman_environment.json   environment Local (baseUrl, token, adminToken, pelangganToken)
```

### Langkah 1 — Install extension Postman di VS Code (satu kali)

1. Buka VS Code di folder project ini.
2. Tekan `Ctrl+Shift+X` → cari **Postman** → Install yang publisher-nya **Postman** (`postman.postman-for-vscode`).
   - Extension ini sudah didaftarkan di `.vscode/extensions.json`, jadi VS Code otomatis menawarkannya sebagai workspace recommendation.
3. Setelah install, ikon **Postman** muncul di activity bar (sidebar kiri). Login akun Postman bila diminta — koleksi tetap bisa dipakai lokal via Import file.
4. **Tidak perlu install aplikasi Postman desktop** — semua request dijalankan dari panel Postman di dalam VS Code.

### Langkah 2 — Import koleksi + environment (satu kali)

1. Klik ikon **Postman** di activity bar → tab **Collections** → **Import**.
2. Pilih file `toko-alat-musik-api/toko-alat-musik-api.postman_collection.json` → Import.
3. Ulangi Import untuk `toko-alat-musik-api/toko-alat-musik-local.postman_environment.json`.
4. Hasilnya: satu collection **toko-alat-musik-api** (6 folder) + satu environment **toko-alat-musik Local**.
5. Pastikan server jalan (`npm run dev`), lalu di kanan atas panel Postman pilih environment **toko-alat-musik Local** (isinya `baseUrl = http://localhost:3000/api/v1`).

### Langkah 3 — Ambil token (wajib sebelum request ber-auth)

1. Buka folder **Auth** → jalankan **Login Admin** (`admin@tokomusik.com` / `admin123`).
2. Token otomatis tersimpan ke variable `{{token}}` dan `{{adminToken}}` lewat script Tests — cek di tab Tests tiap request login.
3. Semua request yang butuh login sudah memakai header `Authorization: Bearer {{token}}`, jadi tidak perlu copy-paste token manual.
4. Untuk menguji sebagai pelanggan: `Auth → Register Pelanggan` → `Auth → Login Pelanggan` (menimpa `{{token}}`, cadangan tersimpan di `{{pelangganToken}}`).

### Langkah 4 — Urutan test per peran

- Publik (tanpa token): `Kategori → Get Kategori`, `Kategori → Get Daftar Kategori (agregat)`, `Alat Musik → Get Katalog`, `Get Katalog by Kategori`, `Get Detail Alat`.
- Admin (login sebagai admin): `Kategori → Create/Update/Delete Kategori`, `Alat Musik → Get Daftar Lengkap (Admin)`, `Create/Update/Delete Alat`, seluruh folder **Stok**, seluruh folder **Laporan**, `Auth → Get Daftar Admin/Pelanggan`.
- Pelanggan (login sebagai pelanggan): `Pembelian → Checkout` → `Get Riwayat` → `Get Daftar/Detail Pembelian` → `Ubah Status` (hanya ke `selesai`/`dibatalkan` untuk milik sendiri).
- Admin untuk pembelian: `Get Riwayat`, `Get Daftar Pembelian`, `Get Detail by ID`, `Ubah Status` mengikuti alur `pending → diproses → dikirim → selesai` (bisa `dibatalkan` dari `pending`/`diproses`).

Catatan: bila token kedaluwarsa (respons 401), ulangi Langkah 3 lalu kirim ulang request-nya.

## Koneksi Database di VS Code (SQLTools)

1. Di terminal VS Code, isi sekali per sesi: `$env:DB_PASSWORD="isi_password_db_sesuai_env"`.
2. Buka panel SQLTools (ikon database di activity bar) → koneksi **toko-alat-musik (lokal)** → Connect.
3. Query bisa ditulis di file `.sql` lalu Run, atau klik kanan tabel → Show Table Records.

Koneksi tersimpan di `.vscode/settings.json` memakai `"password": "${env:DB_PASSWORD}"` sehingga password tidak ikut ke git.

## Perintah yang Sering Dipakai

| Tujuan | Perintah |
| --- | --- |
| Setup awal DB lokal | `npm run db:setup` |
| Cek koneksi DB | `npm run db:ping` |
| Migrasi saja | `npm run migrate` |
| Jalankan server (watch) | `npm run dev` |
| Jalankan server sekali | `npm start` |
| Cek tipe TypeScript | `npm run typecheck` |
| Masuk ke psql sebagai user aplikasi | `"C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U toko_user -d toko_alat_musik` |

Sesuaikan path `psql.exe` dengan versi PostgreSQL yang terinstal (`...\PostgreSQL\18\bin\...`).

Mengulang dari database kosong (hati-hati, menghapus seluruh data):

```sql
-- lewat psql superuser:
DROP DATABASE toko_alat_musik;
```

lalu `npm run db:setup` lagi.

### Masalah umum

- **`password authentication failed` untuk user postgres**: password superuser salah. Itu password yang dimasukkan saat install PostgreSQL, bukan `DB_PASSWORD`.
- **`password authentication failed` untuk toko_user**: `DB_PASSWORD` di `.env` berubah setelah `db:setup`. Jalankan `npm run db:setup` lagi agar password role ikut diperbarui.
- **Service PostgreSQL tidak jalan**: buka `services.msc`, start `postgresql-x64-18`.
- **`port is already allocated` / konek ke server yang salah**: ada 2 PostgreSQL (Docker + lokal). Hentikan container Docker (`docker compose down`) atau ubah `DB_PORT` di `.env`.
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
