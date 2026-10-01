DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'pelanggan_role') THEN
        CREATE ROLE pelanggan_role;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin_role') THEN
        CREATE ROLE admin_role;
    END IF;
END $$;


REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM PUBLIC;

GRANT USAGE ON SCHEMA public TO pelanggan_role, admin_role;


GRANT SELECT ON v_katalog_alat TO pelanggan_role;
GRANT EXECUTE ON FUNCTION fn_hitung_subtotal(DECIMAL, INT) TO pelanggan_role;
GRANT EXECUTE ON PROCEDURE sp_registrasi_pelanggan(VARCHAR, VARCHAR, VARCHAR, VARCHAR, TEXT, INT) TO pelanggan_role;
GRANT EXECUTE ON PROCEDURE sp_checkout_pembelian(INT, JSONB, INT, DECIMAL) TO pelanggan_role;
GRANT EXECUTE ON PROCEDURE sp_ubah_status_pembelian(INT, VARCHAR, INT, VARCHAR) TO pelanggan_role;


GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin_role;
GRANT EXECUTE ON ALL ROUTINES IN SCHEMA public TO admin_role;
