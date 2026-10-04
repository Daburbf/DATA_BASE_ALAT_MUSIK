//database
import "@config/env";
import { pool } from "@config/db";

async function main(): Promise<void> {
  const now = await pool.query<{ now: string }>("SELECT NOW() AS now");
  const tables = await pool.query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'"
  );
  const views = await pool.query<{ view: string }>(
    "SELECT table_name AS view FROM information_schema.views WHERE table_schema = 'public' ORDER BY 1"
  );

  console.log(`[db:ping] OK — server time: ${now.rows[0]?.now}`);
  console.log(`[db:ping] tabel: ${tables.rows[0]?.count}, view: ${views.rows.length}`);
  for (const v of views.rows) console.log(`  - ${v.view}`);

  await pool.end();
}

main().catch(async (err) => {
  console.error("[db:ping] GAGAL:", err);
  try {
    await pool.end();
  } catch {
    //database
  }
  process.exit(1);
});
