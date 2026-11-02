import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL! },
  // O banco Prisma Postgres tem um schema interno "ppg" que não é nosso.
  schemaFilter: ["public"],
});
