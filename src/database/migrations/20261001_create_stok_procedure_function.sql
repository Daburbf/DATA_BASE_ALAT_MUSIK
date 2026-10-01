CREATE OR REPLACE PROCEDURE sp_tambah_stok(
    p_alat_id INT,
    p_jumlah INT,
    p_admin_id INT
)
LANGUAGE plpgsql AS $$
BEGIN
    IF p_jumlah IS NULL OR p_jumlah <= 0 THEN
        RAISE EXCEPTION 'Jumlah penambahan stok harus lebih dari 0' USING ERRCODE = 'TM400';
    END IF;

    UPDATE stok
    SET jumlah = jumlah + p_jumlah,
        admin_id = p_admin_id,
        updated_at = CURRENT_TIMESTAMP
    WHERE alat_id = p_alat_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Alat musik dengan ID % tidak ditemukan', p_alat_id USING ERRCODE = 'TM404';
    END IF;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_ubah_stok(
    p_stok_id INT,
    p_jumlah INT,
    p_admin_id INT
)
LANGUAGE plpgsql AS $$
BEGIN
    IF p_jumlah IS NULL OR p_jumlah < 0 THEN
        RAISE EXCEPTION 'Jumlah stok tidak boleh negatif' USING ERRCODE = 'TM400';
    END IF;

    UPDATE stok
    SET jumlah = p_jumlah,
        admin_id = p_admin_id,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_stok_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Data stok dengan ID % tidak ditemukan', p_stok_id USING ERRCODE = 'TM404';
    END IF;
END;
$$;
