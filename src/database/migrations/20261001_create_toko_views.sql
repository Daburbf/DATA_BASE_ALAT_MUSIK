CREATE OR REPLACE VIEW v_katalog_alat AS
SELECT
    a.id AS alat_id,
    a.nama_alat,
    a.deskripsi,
    a.harga,
    k.id AS kategori_id,
    k.nama_kategori,
    COALESCE(s.jumlah, 0) AS jumlah_stok
FROM alat_musik a
LEFT JOIN kategori k ON a.kategori_id = k.id
LEFT JOIN stok s ON s.alat_id = a.id
ORDER BY a.id DESC;


CREATE OR REPLACE VIEW v_stok_alat AS
SELECT
    s.id AS stok_id,
    s.alat_id,
    a.nama_alat,
    s.jumlah,
    ad.nama AS nama_admin,
    s.updated_at
FROM stok s
JOIN alat_musik a ON s.alat_id = a.id
LEFT JOIN admin ad ON s.admin_id = ad.id
ORDER BY s.id DESC;


CREATE OR REPLACE VIEW v_riwayat_pembelian AS
SELECT
    p.id AS pembelian_id,
    p.pelanggan_id,
    pl.nama AS nama_pelanggan,
    p.status,
    p.total,
    p.created_at AS tanggal_pembelian,
    COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'alat_id', d.alat_id,
                'nama_alat', a.nama_alat,
                'jumlah', d.jumlah,
                'harga_satuan', d.harga_satuan,
                'subtotal', d.subtotal
            ) ORDER BY d.id
        ) FILTER (WHERE d.id IS NOT NULL),
        '[]'::jsonb
    ) AS rincian
FROM pembelian p
JOIN pelanggan pl ON p.pelanggan_id = pl.id
LEFT JOIN detail_pembelian d ON d.pembelian_id = p.id
LEFT JOIN alat_musik a ON d.alat_id = a.id
GROUP BY
    p.id,
    p.pelanggan_id,
    pl.nama,
    p.status,
    p.total,
    p.created_at
ORDER BY p.id DESC;


CREATE OR REPLACE VIEW v_alat_terlaris AS
SELECT
    a.id AS alat_id,
    a.nama_alat,
    SUM(d.jumlah)::INT AS total_terjual,
    SUM(d.subtotal) AS total_pendapatan
FROM detail_pembelian d
JOIN pembelian p ON d.pembelian_id = p.id
JOIN alat_musik a ON d.alat_id = a.id
WHERE p.status = 'selesai'
GROUP BY a.id, a.nama_alat
ORDER BY total_terjual DESC, a.id ASC;


CREATE OR REPLACE VIEW v_log_aktivitas_terbaru AS
SELECT
    id AS log_id,
    sumber_event,
    keterangan,
    created_at
FROM log_aktivitas
ORDER BY id DESC
LIMIT 100;
