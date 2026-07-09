import { db } from "@/db";
import { twoFactorAuth } from "@/db/schema";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import * as crypto from "crypto";

export function generateSecret(): string {
  return crypto.randomBytes(20).toString("hex");
}

export function generateBackupCodes(count = 5): string[] {
  return Array.from({ length: count }, () => nanoid(8).toUpperCase());
}

export async function enable2FA(userId: string) {
  const secret = generateSecret();
  const backupCodes = generateBackupCodes();

  await db
    .insert(twoFactorAuth)
    .values({
      userId,
      secret,
      enabled: true,
      backupCodes,
    })
    .onConflictDoUpdate({
      target: twoFactorAuth.userId,
      set: { secret, enabled: true, backupCodes },
    });

  return { secret, backupCodes };
}

export async function verify2FA(userId: string, code: string): Promise<boolean> {
  const record = await db
    .select()
    .from(twoFactorAuth)
    .where(eq(twoFactorAuth.userId, userId))
    .limit(1);

  if (!record.length || !record[0].enabled) return true; // 2FA not enabled

  // Simple verification (in production use TOTP library)
  return record[0].secret === code || 
         (record[0].backupCodes || []).includes(code);
}

export async function disable2FA(userId: string) {
  await db
    .update(twoFactorAuth)
    .set({ enabled: false })
    .where(eq(twoFactorAuth.userId, userId));
}