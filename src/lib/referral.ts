import { db } from "@/db";
import { referrals, loyaltyPoints, users } from "@/db/schema";
import { nanoid } from "nanoid";
import { eq, and } from "drizzle-orm";

export async function createReferral(referrerId: string, referredId: string) {
  // Prevent self-referral
  if (referrerId === referredId) return null;

  // Check if already referred
  const existing = await db
    .select()
    .from(referrals)
    .where(and(
      eq(referrals.referrerId, referrerId),
      eq(referrals.referredId, referredId)
    ))
    .limit(1);

  if (existing.length > 0) return null;

  const referral = await db
    .insert(referrals)
    .values({
      id: nanoid(12),
      referrerId,
      referredId,
      status: "PENDING",
      bonusPoints: 100,
    })
    .returning();

  return referral[0];
}

export async function completeReferral(referredId: string) {
  const referral = await db
    .select()
    .from(referrals)
    .where(and(
      eq(referrals.referredId, referredId),
      eq(referrals.status, "PENDING")
    ))
    .limit(1);

  if (!referral.length) return null;

  const ref = referral[0];

  // Award points to referrer
  await db
    .update(loyaltyPoints)
    .set({
      points: loyaltyPoints.points + ref.bonusPoints,
      totalEarned: loyaltyPoints.totalEarned + ref.bonusPoints,
    })
    .where(eq(loyaltyPoints.userId, ref.referrerId));

  // Mark referral as completed
  await db
    .update(referrals)
    .set({ status: "COMPLETED" })
    .where(eq(referrals.id, ref.id));

  return ref;
}

export async function getReferralCode(userId: string): Promise<string> {
  const user = await db
    .select({ referralCode: users.referralCode })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (user[0]?.referralCode) return user[0].referralCode;

  // Generate new code
  const code = `KIYA-${nanoid(6).toUpperCase()}`;
  await db
    .update(users)
    .set({ referralCode: code })
    .where(eq(users.id, userId));

  return code;
}