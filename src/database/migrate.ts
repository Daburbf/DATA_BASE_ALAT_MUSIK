import { pool, withTransaction } from "../config/db";
import path from "path";
import { readFile, stat } from "fs/promises";

const migrationFiles = [
   "src/database/migrations/20261001_create_toko_schema.sql",
   "src/database/migrations/20261001_create_auth_procedure_function.sql",
   "src/database/migrations/20261001_create_stok_procedure_function.sql",
   "src/database/migrations/20261001_create_pembelian_procedure_function.sql",
   "src/database/migrations/20261001_create_toko_triggers.sql",
   "src/database/migrations/20261001_create_toko_views.sql",
   "src/database/migrations/20261001_seed_toko_data.sql",
   "src/database/migrations/20261001_create_toko_privileges.sql",
   "src/database/migrations/20261002_fix_out_params.sql",
   "src/database/migrations/20261003_controller_views.sql"
];

async function migrate() {
   try {
      console.log("Starting database migrations...\n");

      await pool.query(`
         CREATE TABLE IF NOT EXISTS schema_migrations (
            filename VARCHAR(255) PRIMARY KEY,
            applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
         )
      `);

      const applied = await pool.query<{ filename: string }>("SELECT filename FROM schema_migrations");
      const appliedFiles = new Set(applied.rows.map((row) => row.filename));

      for (const filePath of migrationFiles) {
         const absolutePath = path.join(process.cwd(), filePath);
         const fileName = filePath.split("/").pop() as string;

         if (appliedFiles.has(fileName)) {
            console.log(`Skipped (already applied): ${fileName}\n`);
            continue;
         }

         console.log(`Executing: ${fileName}`);

         let sqlContent: string;
         try {
            await stat(absolutePath);
         } catch {
            throw new Error(`File missing: ${absolutePath}`);
         }

         sqlContent = await readFile(absolutePath, "utf-8");

         await withTransaction(async (client) => {
            await client.query(sqlContent);
            await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [fileName]);
         });

         console.log(`Success: ${fileName}\n`);
      }

      console.log("All migrations finished successfully!");
   } catch (error) {
      console.error("Migration failed:", error);
      process.exitCode = 1;
   } finally {
      await pool.end();
      process.exit();
   }
}

migrate();
