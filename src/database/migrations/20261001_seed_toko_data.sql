INSERT INTO admin (nama, email, password) VALUES
    ('Budi Santoso', 'admin@tokomusik.com', crypt('admin123', gen_salt('bf', 10)));

INSERT INTO kategori (nama_kategori, deskripsi) VALUES
    ('Gitar', 'Gitar akustik, elektrik, dan ukulele'),
    ('Keyboard', 'Keyboard dan piano digital'),
    ('Drum & Perkusi', 'Drum, snare, dan alat perkusi lainnya'),
    ('Alat Tiup', 'Seruling, recorder, dan harmonika');

INSERT INTO alat_musik (kategori_id, nama_alat, deskripsi, harga)
SELECT k.id, v.nama_alat, v.deskripsi, v.harga
FROM (VALUES
    ('Gitar',          'Gitar Akustik Yamaha F310',     'Gitar akustik pemula dengan top spruce',          1850000.00),
    ('Gitar',          'Gitar Elektrik Ibanez GRG121',  'Gitar elektrik dengan pickup humbucker',          3200000.00),
    ('Gitar',          'Ukulele Soprano Mahogany',      'Ukulele soprano bodi mahoni',                      450000.00),
    ('Keyboard',       'Keyboard Casio CT-S300',        'Keyboard 61 tuts dengan 400 nada',                2750000.00),
    ('Drum & Perkusi', 'Snare Drum Pearl 14 inch',      'Snare drum 14 inch bodi baja',                    1950000.00),
    ('Alat Tiup',      'Recorder Yamaha YRS-24B',       'Recorder soprano sistem Baroque',                  150000.00)
) AS v(nama_kategori, nama_alat, deskripsi, harga)
JOIN kategori k ON k.nama_kategori = v.nama_kategori;

DO $$
DECLARE
    v_admin_id INT;
    item RECORD;
BEGIN
    SELECT id INTO v_admin_id FROM admin WHERE email = 'admin@tokomusik.com';

    FOR item IN
        SELECT a.id AS alat_id, v.jumlah
        FROM (VALUES
            ('Gitar Akustik Yamaha F310', 15),
            ('Gitar Elektrik Ibanez GRG121', 8),
            ('Ukulele Soprano Mahogany', 25),
            ('Keyboard Casio CT-S300', 10),
            ('Snare Drum Pearl 14 inch', 6),
            ('Recorder Yamaha YRS-24B', 40)
        ) AS v(nama_alat, jumlah)
        JOIN alat_musik a ON a.nama_alat = v.nama_alat
    LOOP
        CALL sp_tambah_stok(item.alat_id, item.jumlah, v_admin_id);
    END LOOP;
END $$;
