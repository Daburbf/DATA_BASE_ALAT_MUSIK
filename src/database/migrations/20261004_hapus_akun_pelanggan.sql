-- Hapus akun pelanggan (self-service & admin).
-- Dipakai endpoint DELETE /auth/me (pelanggan menghapus akunnya sendiri)
-- dan DELETE /auth/pelanggan/:id (admin menghapus akun pelanggan mana pun).
-- Aturan: akun yang masih memiliki riwayat pembelian TIDAK boleh dihapus
-- (menjaga integritas laporan), sejajar dengan trigger trg_cegah_hapus_alat_terjual.

CREATE OR REPLACE PROCEDURE sp_hapus_pelanggan(
    p_pelanggan_id INT,
    p_akun_id INT,
    p_role VARCHAR
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF p_role = 'pelanggan' THEN
        -- Pelanggan hanya boleh menghapus akun miliknya sendiri.
        IF p_pelanggan_id <> p_akun_id THEN
            RAISE EXCEPTION 'Anda hanya dapat menghapus akun milik sendiri' USING ERRCODE = 'TM403';
        END IF;
    ELSIF p_role <> 'admin' THEN
        RAISE EXCEPTION 'Role tidak diizinkan menghapus akun pelanggan' USING ERRCODE = 'TM403';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pelanggan WHERE id = p_pelanggan_id) THEN
        RAISE EXCEPTION 'Pelanggan dengan ID % tidak ditemukan', p_pelanggan_id USING ERRCODE = 'TM404';
    END IF;

    IF EXISTS (SELECT 1 FROM pembelian WHERE pelanggan_id = p_pelanggan_id) THEN
        RAISE EXCEPTION 'Akun pelanggan tidak dapat dihapus karena memiliki riwayat pembelian' USING ERRCODE = 'TM409';
    END IF;

    DELETE FROM pelanggan WHERE id = p_pelanggan_id;
END;
$$;

GRANT EXECUTE ON PROCEDURE sp_hapus_pelanggan(INT, INT, VARCHAR) TO pelanggan_role;
GRANT EXECUTE ON PROCEDURE sp_hapus_pelanggan(INT, INT, VARCHAR) TO admin_role;
