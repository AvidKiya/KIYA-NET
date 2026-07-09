// Cloudflare D1 + Drizzle adapter (Edge compatible)
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export type DbType = ReturnType<typeof drizzle<typeof schema>>;

let cachedDb: DbType | null = null;

export function getDb(env?: { DB: D1Database }): DbType {
  if (cachedDb) return cachedDb;

  // For local development or when env is passed
  const dbBinding = env?.DB || (globalThis as any).DB || (process.env as any).DB;

  if (!dbBinding) {
    throw new Error("D1 Database binding 'DB' is not available");
  }

  const db = drizzle(dbBinding, { schema });
  cachedDb = db;
  return db;
}

// Lazy proxy for easy usage in API routes
export const db = new Proxy({} as DbType, {
  get(_target, prop) {
    const instance = getDb();
    const value = instance[prop as keyof DbType];
    return typeof value === "function" ? value.bind(instance) : value;
  },
  set(_target, prop, value) {
    const instance = getDb();
    (instance as any)[prop] = value;
    return true;
  },
});

export { schema };