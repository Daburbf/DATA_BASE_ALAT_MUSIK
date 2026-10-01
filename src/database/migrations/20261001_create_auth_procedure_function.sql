CREATE OR REPLACE FUNCTION fn_ambil_akun_login(p_email VARCHAR)
RETURNS TABLE (
    akun_id INT,
    nama VARCHAR,
    email VARCHAR,
    password VARCHAR,
    role VARCHAR
)
LANGUAGE sql STABLE AS $$
    SELECT a.id, a.nama, a.email, a.password, 'admin'::VARCHAR
    FROM admin a
    WHERE a.email = lower(trim(p_email))
    UNION ALL
    SELECT p.id, p.nama, p.email, p.password, 'pelanggan'::VARCHAR
    FROM pelanggan p
    WHERE p.email = lower(trim(p_email))
    LIMIT 1;
$$;

CREATE OR REPLACE PROCEDURE sp_registrasi_pelanggan(
    p_nama VARCHAR,
    p_email VARCHAR,
    p_password_hash VARCHAR,
    p_telepon VARCHAR,
    p_alamat TEXT,
    INOUT p_pelanggan_id INT DEFAULT NULL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_email VARCHAR := lower(trim(p_email));
BEGIN
    IF EXISTS (SELECT 1 FROM admin WHERE email = v_email)
       OR EXISTS (SELECT 1 FROM pelanggan WHERE email = v_email) THEN
        RAISE EXCEPTION 'Email sudah terdaftar' USING ERRCODE = 'TM409';
    END IF;

    INSERT INTO pelanggan (nama, email, password, telepon, alamat)
    VALUES (trim(p_nama), v_email, p_password_hash, p_telepon, p_alamat)
    RETURNING id INTO p_pelanggan_id;
END;
$$;
