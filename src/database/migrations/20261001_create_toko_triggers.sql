CREATE OR REPLACE FUNCTION trg_buat_stok_awal_fn()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO stok (alat_id, jumlah) VALUES (NEW.id, 0);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_buat_stok_awal
    AFTER INSERT ON alat_musik
    FOR EACH ROW
    EXECUTE FUNCTION trg_buat_stok_awal_fn();


CREATE OR REPLACE FUNCTION trg_cegah_hapus_alat_terjual_fn()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM detail_pembelian WHERE alat_id = OLD.id) THEN
        RAISE EXCEPTION 'Alat musik "%" tidak dapat dihapus karena sudah memiliki riwayat pembelian', OLD.nama_alat
            USING ERRCODE = 'TM409';
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_cegah_hapus_alat_terjual
    BEFORE DELETE ON alat_musik
    FOR EACH ROW
    EXECUTE FUNCTION trg_cegah_hapus_alat_terjual_fn();


CREATE OR REPLACE FUNCTION trg_audit_stok_fn()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.jumlah <> NEW.jumlah THEN
        INSERT INTO log_aktivitas (sumber_event, keterangan)
        VALUES (
            'STOK',
            'Stok alat ID ' || NEW.alat_id || ' berubah dari ' || OLD.jumlah || ' ke ' || NEW.jumlah
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_audit_stok
    AFTER UPDATE ON stok
    FOR EACH ROW
    EXECUTE FUNCTION trg_audit_stok_fn();


CREATE OR REPLACE FUNCTION trg_log_pembelian_fn()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO log_aktivitas (sumber_event, keterangan)
    VALUES (
        'PEMBELIAN',
        'Pembelian ID ' || NEW.id || ' dibuat oleh Pelanggan ID ' || NEW.pelanggan_id
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_log_pembelian
    AFTER INSERT ON pembelian
    FOR EACH ROW
    EXECUTE FUNCTION trg_log_pembelian_fn();


CREATE OR REPLACE FUNCTION trg_log_status_pembelian_fn()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO log_aktivitas (sumber_event, keterangan)
    VALUES (
        'STATUS_PEMBELIAN',
        'Pembelian ID ' || NEW.id || ' berubah status dari ' || OLD.status || ' ke ' || NEW.status
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_log_status_pembelian
    AFTER UPDATE OF status ON pembelian
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION trg_log_status_pembelian_fn();


CREATE OR REPLACE FUNCTION trg_kembalikan_stok_fn()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE stok s
    SET jumlah = s.jumlah + d.jumlah,
        updated_at = CURRENT_TIMESTAMP
    FROM detail_pembelian d
    WHERE d.pembelian_id = NEW.id
      AND s.alat_id = d.alat_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_kembalikan_stok
    AFTER UPDATE OF status ON pembelian
    FOR EACH ROW
    WHEN (OLD.status <> 'dibatalkan' AND NEW.status = 'dibatalkan')
    EXECUTE FUNCTION trg_kembalikan_stok_fn();
