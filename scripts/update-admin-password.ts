import "dotenv/config";
import { db } from "../src/db";
import { users } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "../src/lib/auth";

async function main() {
  const phone = "0690901038";
  const password = "AvidKiya*2397*7370#";
  const passwordHash = await hashPassword(password);

  const existing = await db.select().from(users).where(eq(users.phoneNumber, phone)).limit(1).then((r) => r[0]);
  if (existing) {
    await db.update(users).set({ passwordHash, mustChangePassword: true }).where(eq(users.id, existing.id));
    console.log("Admin password updated to new hash format");
  } else {
    console.log("Admin not found");
  }
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
