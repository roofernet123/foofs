import { defineConfig } from "drizzle-kit";
import type { Config } from "drizzle-kit";
import "dotenv/config";

const migrationUrl = process.env.MIGRATION_DATABASE_URL;

if (!migrationUrl) {
  throw new Error("Missing MIGRATION_DATABASE_URL environment variable");
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: migrationUrl,
  },
  tablesFilter: ["!faqs", "!regions", "!wineries"],
} satisfies Config);