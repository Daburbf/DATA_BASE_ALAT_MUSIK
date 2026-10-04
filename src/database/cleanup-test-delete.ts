import "@config/env";
import { pool } from "@config/db";

async function main(): Promise<void> {
  const testEmails = ["hapus.tes@mail.com", "admin.hapus@mail.com", "riwayat.tes@mail.com"];
  for (const email of testEmails) {
    const pel = await pool.query<{ id: number }>("SELECT id FROM pelanggan WHERE email = $1", [email]);
    for (const row of pel.rows) {
      await pool.query("DELETE FROM pembelian WHERE pelanggan_id = $1", [row.id]);
      await pool.query("DELETE FROM pelanggan WHERE id = $1", [row.id]);
      console.log(`dibersihkan: ${email} (id=${row.id})`);
    }
  }
  await pool.end();
}

main().catch(async (err) => {
  console.error("GAGAL:", err);
  try {
    await pool.end();
  } catch {
    //database
  }
  process.exit(1);
});
