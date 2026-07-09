// Cloudflare D1 Database helper
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function createD1Database(d1: D1Database) {
  return drizzle(d1, { schema });
}

// Helper to get DB from Cloudflare Pages context
export function getD1FromContext(context: any) {
  const d1 = context?.env?.DB || context?.cloudflare?.env?.DB;
  if (!d1) {
    throw new Error("D1 binding not found in context");
  }
  return createD1Database(d1);
}