CREATE OR REPLACE FUNCTION fn_hitung_subtotal(p_harga DECIMAL, p_jumlah INT)
RETURNS DECIMAL LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
    RETURN p_harga * p_jumlah;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_checkout_pembelian(
    p_pelanggan_id INT,
    p_items JSONB,
    INOUT p_pembelian_id INT DEFAULT NULL,
    INOUT p_total DECIMAL DEFAULT NULL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    item RECORD;
    v_harga DECIMAL;
    v_stok INT;
    v_total DECIMAL := 0;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pelanggan WHERE id = p_pelanggan_id) THEN
        RAISE EXCEPTION 'Pelanggan dengan ID % tidak ditemukan', p_pelanggan_id USING ERRCODE = 'TM404';
    END IF;

    IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'Daftar barang tidak boleh kosong' USING ERRCODE = 'TM400';
    END IF;

    INSERT INTO pembelian (pelanggan_id) VALUES (p_pelanggan_id)
    RETURNING id INTO p_pembelian_id;

    --pembelian
    FOR item IN
        SELECT (value->>'alat_id')::INT AS a_id,
               SUM((value->>'jumlah')::INT)::INT AS qty
        FROM jsonb_array_elements(p_items)
        GROUP BY (value->>'alat_id')::INT
        ORDER BY (value->>'alat_id')::INT
    LOOP
        IF item.a_id IS NULL OR item.qty IS NULL OR item.qty <= 0 THEN
            RAISE EXCEPTION 'Setiap barang wajib memiliki alat_id dan jumlah lebih dari 0' USING ERRCODE = 'TM400';
        END IF;

        SELECT a.harga, s.jumlah INTO v_harga, v_stok
        FROM alat_musik a
        JOIN stok s ON s.alat_id = a.id
        WHERE a.id = item.a_id
        FOR UPDATE OF s;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Alat musik dengan ID % tidak ditemukan', item.a_id USING ERRCODE = 'TM404';
        END IF;

        IF v_stok < item.qty THEN
            RAISE EXCEPTION 'Stok alat musik ID % tidak mencukupi (tersisa %)', item.a_id, v_stok USING ERRCODE = 'TM409';
        END IF;

        INSERT INTO detail_pembelian (pembelian_id, alat_id, jumlah, harga_satuan, subtotal)
        VALUES (p_pembelian_id, item.a_id, item.qty, v_harga, fn_hitung_subtotal(v_harga, item.qty));

        UPDATE stok
        SET jumlah = jumlah - item.qty,
            updated_at = CURRENT_TIMESTAMP
        WHERE alat_id = item.a_id;

        v_total := v_total + fn_hitung_subtotal(v_harga, item.qty);
    END LOOP;

    UPDATE pembelian SET total = v_total WHERE id = p_pembelian_id;
    p_total := v_total;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_ubah_status_pembelian(
    p_pembelian_id INT,
    p_status_baru VARCHAR,
    p_akun_id INT,
    p_role VARCHAR
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_status_lama VARCHAR(20);
    v_pelanggan_id INT;
BEGIN
    IF p_status_baru IS NULL OR p_status_baru NOT IN ('diproses', 'dikirim', 'selesai', 'dibatalkan') THEN
        RAISE EXCEPTION 'Status tujuan tidak valid' USING ERRCODE = 'TM400';
    END IF;

    SELECT status, pelanggan_id INTO v_status_lama, v_pelanggan_id
    FROM pembelian
    WHERE id = p_pembelian_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pembelian dengan ID % tidak ditemukan', p_pembelian_id USING ERRCODE = 'TM404';
    END IF;

    IF p_role = 'pelanggan' THEN
        IF v_pelanggan_id <> p_akun_id THEN
            RAISE EXCEPTION 'Pembelian bukan milik Anda' USING ERRCODE = 'TM403';
        END IF;

        IF p_status_baru NOT IN ('selesai', 'dibatalkan') THEN
            RAISE EXCEPTION 'Pelanggan hanya dapat menyelesaikan atau membatalkan pembelian' USING ERRCODE = 'TM403';
        END IF;
    ELSIF p_role <> 'admin' THEN
        RAISE EXCEPTION 'Role tidak diizinkan mengubah status pembelian' USING ERRCODE = 'TM403';
    END IF;

    IF NOT (
        (v_status_lama = 'pending'  AND p_status_baru IN ('diproses', 'dibatalkan')) OR
        (v_status_lama = 'diproses' AND p_status_baru IN ('dikirim', 'dibatalkan')) OR
        (v_status_lama = 'dikirim'  AND p_status_baru = 'selesai')
    ) THEN
        RAISE EXCEPTION 'Status pembelian tidak dapat diubah dari % ke %', v_status_lama, p_status_baru USING ERRCODE = 'TM409';
    END IF;

    UPDATE pembelian SET status = p_status_baru WHERE id = p_pembelian_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_laporan_penjualan_bulanan(
    p_bulan INT,
    p_tahun INT
)
RETURNS TABLE (
    total_transaksi INT,
    total_item_terjual INT,
    total_pendapatan DECIMAL
)
LANGUAGE plpgsql STABLE AS $$
DECLARE
    v_awal DATE;
BEGIN
    IF p_bulan IS NULL OR p_bulan NOT BETWEEN 1 AND 12 THEN
        RAISE EXCEPTION 'Bulan harus berada di antara 1 sampai 12' USING ERRCODE = 'TM400';
    END IF;

    IF p_tahun IS NULL OR p_tahun NOT BETWEEN 2000 AND 2100 THEN
        RAISE EXCEPTION 'Tahun tidak valid' USING ERRCODE = 'TM400';
    END IF;

    v_awal := make_date(p_tahun, p_bulan, 1);

    RETURN QUERY
    SELECT
        COUNT(DISTINCT p.id)::INT,
        COALESCE(SUM(d.jumlah), 0)::INT,
        COALESCE(SUM(d.subtotal), 0)
    FROM pembelian p
    JOIN detail_pembelian d ON d.pembelian_id = p.id
    WHERE p.status = 'selesai'
      AND p.created_at >= v_awal
      AND p.created_at < v_awal + INTERVAL '1 month';
END;
$$;
