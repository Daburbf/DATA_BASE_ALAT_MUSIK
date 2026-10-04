CREATE OR REPLACE VIEW v_daftar_admin AS
SELECT
    id AS admin_id,
    nama,
    email,
    created_at
FROM admin
ORDER BY id DESC;

CREATE OR REPLACE VIEW v_daftar_pelanggan AS
SELECT
    pl.id AS pelanggan_id,
    pl.nama,
    pl.email,
    pl.telepon,
    pl.alamat,
    pl.created_at,
    COUNT(p.id)::INT AS jumlah_pembelian,
    COALESCE(SUM(CASE WHEN p.status = 'selesai' THEN p.total ELSE 0 END), 0) AS total_belanja
FROM pelanggan pl
LEFT JOIN pembelian p ON p.pelanggan_id = pl.id
GROUP BY
    pl.id,
    pl.nama,
    pl.email,
    pl.telepon,
    pl.alamat,
    pl.created_at
ORDER BY pl.id DESC;

CREATE OR REPLACE VIEW v_daftar_kategori AS
SELECT
    k.id,
    k.nama_kategori,
    k.deskripsi,
    k.created_at,
    COUNT(a.id)::INT AS jumlah_alat,
    COALESCE(SUM(s.jumlah), 0)::INT AS total_stok
FROM kategori k
LEFT JOIN alat_musik a ON a.kategori_id = k.id
LEFT JOIN stok s ON s.alat_id = a.id
GROUP BY
    k.id,
    k.nama_kategori,
    k.deskripsi,
    k.created_at
ORDER BY k.id DESC;


--alat
CREATE OR REPLACE VIEW v_daftar_alat AS
SELECT
    a.id AS alat_id,
    a.nama_alat,
    a.deskripsi,
    a.harga,
    k.id AS kategori_id,
    k.nama_kategori,
    COALESCE(s.jumlah, 0) AS jumlah_stok,
    s.id AS stok_id,
    a.created_at
FROM alat_musik a
LEFT JOIN kategori k ON a.kategori_id = k.id
LEFT JOIN stok s ON s.alat_id = a.id
ORDER BY a.id DESC;


--stok
CREATE OR REPLACE VIEW v_ringkasan_stok AS
SELECT
    COUNT(*)::INT AS total_alat,
    COALESCE(SUM(jumlah), 0)::INT AS total_unit,
    (COUNT(*) FILTER (WHERE jumlah = 0))::INT AS stok_kosong,
    (COUNT(*) FILTER (WHERE jumlah > 0 AND jumlah <= 5))::INT AS stok_menipis
FROM stok;


--pembelian
CREATE OR REPLACE VIEW v_daftar_pembelian AS
SELECT
    p.id AS pembelian_id,
    p.pelanggan_id,
    pl.nama AS nama_pelanggan,
    pl.email AS email_pelanggan,
    p.status,
    p.total,
    COUNT(d.id)::INT AS jumlah_item,
    p.created_at AS tanggal_pembelian
FROM pembelian p
JOIN pelanggan pl ON p.pelanggan_id = pl.id
LEFT JOIN detail_pembelian d ON d.pembelian_id = p.id
GROUP BY
    p.id,
    p.pelanggan_id,
    pl.nama,
    pl.email,
    p.status,
    p.total,
    p.created_at
ORDER BY p.id DESC;

--pembelian
CREATE OR REPLACE VIEW v_detail_pembelian AS
SELECT
    d.id AS detail_id,
    d.pembelian_id,
    p.pelanggan_id,
    pl.nama AS nama_pelanggan,
    d.alat_id,
    a.nama_alat,
    k.nama_kategori,
    d.jumlah,
    d.harga_satuan,
    d.subtotal,
    p.status AS status_pembelian,
    p.created_at AS tanggal_pembelian
FROM detail_pembelian d
JOIN pembelian p ON d.pembelian_id = p.id
JOIN pelanggan pl ON p.pelanggan_id = pl.id
JOIN alat_musik a ON d.alat_id = a.id
LEFT JOIN kategori k ON a.kategori_id = k.id
ORDER BY d.id DESC;


--laporan
CREATE OR REPLACE VIEW v_pendapatan_per_kategori AS
SELECT
    k.id AS kategori_id,
    k.nama_kategori,
    COUNT(DISTINCT p.id)::INT AS jumlah_transaksi,
    COALESCE(SUM(d.jumlah) FILTER (WHERE p.id IS NOT NULL), 0)::INT AS total_terjual,
    COALESCE(SUM(d.subtotal) FILTER (WHERE p.id IS NOT NULL), 0) AS total_pendapatan
FROM kategori k
LEFT JOIN alat_musik a ON a.kategori_id = k.id
LEFT JOIN detail_pembelian d ON d.alat_id = a.id
LEFT JOIN pembelian p ON d.pembelian_id = p.id AND p.status = 'selesai'
GROUP BY
    k.id,
    k.nama_kategori
ORDER BY total_pendapatan DESC;

--laporan
CREATE OR REPLACE VIEW v_penjualan_per_bulan AS
SELECT
    EXTRACT(YEAR FROM p.created_at)::INT AS tahun,
    EXTRACT(MONTH FROM p.created_at)::INT AS bulan,
    COUNT(DISTINCT p.id)::INT AS jumlah_transaksi,
    COALESCE(SUM(d.jumlah), 0)::INT AS jumlah_item,
    COALESCE(SUM(d.subtotal), 0) AS pendapatan
FROM pembelian p
JOIN detail_pembelian d ON d.pembelian_id = p.id
WHERE p.status = 'selesai'
GROUP BY 1, 2
ORDER BY 1 DESC, 2 DESC;

--laporan
CREATE OR REPLACE VIEW v_log_aktivitas AS
SELECT
    id AS log_id,
    sumber_event,
    keterangan,
    created_at
FROM log_aktivitas
ORDER BY id DESC;


--laporan
GRANT SELECT ON v_daftar_admin TO admin_role;
GRANT SELECT ON v_ringkasan_stok TO admin_role;
GRANT SELECT ON v_log_aktivitas TO admin_role;
GRANT SELECT ON v_pendapatan_per_kategori TO admin_role;
GRANT SELECT ON v_penjualan_per_bulan TO admin_role;

GRANT SELECT ON v_daftar_kategori TO admin_role, pelanggan_role;
GRANT SELECT ON v_daftar_alat TO admin_role, pelanggan_role;
GRANT SELECT ON v_daftar_pelanggan TO admin_role;
GRANT SELECT ON v_daftar_pembelian TO admin_role, pelanggan_role;
GRANT SELECT ON v_detail_pembelian TO admin_role, pelanggan_role;
