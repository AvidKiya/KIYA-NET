// Original Neon + Drizzle adapter (works on Cloudflare Pages Edge)
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

type DbType = ReturnType<typeof drizzle<typeof schema>>;

let cachedDb: DbType | null = null;

function createDb(): DbType {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  if (cachedDb) return cachedDb;

  const sql = neon(databaseUrl);
  const db = drizzle(sql, { schema });
  cachedDb = db;
  return db;
}

export const db = new Proxy({} as DbType, {
  get(_target, prop) {
    const instance = createDb();
    const value = instance[prop as keyof DbType];
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  },
  set(_target, prop, value) {
    const instance = createDb();
    (instance as any)[prop] = value;
    return true;
  },
});

export function getDb(): DbType {
  return createDb();
}

export { schema };