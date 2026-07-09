import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  driver: "d1-http",
  dbCredentials: {
    wranglerConfigPath: "./wrangler.toml",
    dbName: "kiya-net-db",
  },
});