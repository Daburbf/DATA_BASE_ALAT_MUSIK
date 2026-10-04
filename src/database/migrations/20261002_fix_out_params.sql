--pembelian
CREATE OR REPLACE FUNCTION fn_registrasi_pelanggan(
    p_nama VARCHAR,
    p_email VARCHAR,
    p_password_hash VARCHAR,
    p_telepon VARCHAR,
    p_alamat TEXT
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_pelanggan_id INT;
BEGIN
    CALL sp_registrasi_pelanggan(
        p_nama,
        p_email,
        p_password_hash,
        p_telepon,
        p_alamat,
        v_pelanggan_id
    );

    RETURN v_pelanggan_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_checkout_pembelian(
    p_pelanggan_id INT,
    p_items JSONB
)
RETURNS TABLE (
    pembelian_id INT,
    total DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_pembelian_id INT;
    v_total DECIMAL;
BEGIN
    CALL sp_checkout_pembelian(
        p_pelanggan_id,
        p_items,
        v_pembelian_id,
        v_total
    );

    pembelian_id := v_pembelian_id;
    total := v_total;
    RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION fn_registrasi_pelanggan(VARCHAR, VARCHAR, VARCHAR, VARCHAR, TEXT) TO pelanggan_role;
GRANT EXECUTE ON FUNCTION fn_checkout_pembelian(INT, JSONB) TO pelanggan_role;
GRANT EXECUTE ON FUNCTION fn_registrasi_pelanggan(VARCHAR, VARCHAR, VARCHAR, VARCHAR, TEXT) TO admin_role;
GRANT EXECUTE ON FUNCTION fn_checkout_pembelian(INT, JSONB) TO admin_role;
