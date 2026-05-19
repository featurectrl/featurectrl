import path from "node:path";
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "@/db";

const BASE_DIR = path.dirname(fileURLToPath(import.meta.url));

const MIGRATIONS_DIR = path.resolve(BASE_DIR, "./db/migrations");

async function main() {
  console.info(`Running migrations from ${MIGRATIONS_DIR}`);

  await migrate(db, {
    migrationsFolder: MIGRATIONS_DIR,
    migrationsTable: "_migrations",
    migrationsSchema: "public",
  });

  console.info("Migrations applied!");
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
