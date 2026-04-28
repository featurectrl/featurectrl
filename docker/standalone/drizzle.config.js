import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
  out: "./migrations",
  migrations: { prefix: "index", schema: "public", table: "_migrations" },
});
