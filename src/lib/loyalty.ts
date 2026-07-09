import { db } from "@/db";
import { loyaltyPoints, loyaltyTransactions, users } from "@/db/schema";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

const LEVELS = {
  Bronze: { min: 0, multiplier: 1 },
  Silver: { min: 500, multiplier: 1.2 },
  Gold: { min: 1500, multiplier: 1.5 },
  Platinum: { min: 3000, multiplier: 2 },
};

export async function awardPoints(userId: string, points: number, description: string, orderId?: string) {
  // Get or create loyalty record
  let loyalty = await db
    .select()
    .from(loyaltyPoints)
    .where(eq(loyaltyPoints.userId, userId))
    .limit(1);

  if (!loyalty.length) {
    await db.insert(loyaltyPoints).values({
      id: nanoid(12),
      userId,
      points: 0,
      totalEarned: 0,
      level: "Bronze",
    });
    loyalty = await db
      .select()
      .from(loyaltyPoints)
      .where(eq(loyaltyPoints.userId, userId))
      .limit(1);
  }

  const current = loyalty[0];
  const newPoints = current.points + points;
  const newTotal = current.totalEarned + points;

  // Calculate level
  let newLevel = "Bronze";
  if (newTotal >= LEVELS.Platinum.min) newLevel = "Platinum";
  else if (newTotal >= LEVELS.Gold.min) newLevel = "Gold";
  else if (newTotal >= LEVELS.Silver.min) newLevel = "Silver";

  // Update loyalty
  await db
    .update(loyaltyPoints)
    .set({
      points: newPoints,
      totalEarned: newTotal,
      level: newLevel,
      updatedAt: new Date(),
    })
    .where(eq(loyaltyPoints.userId, userId));

  // Log transaction
  await db.insert(loyaltyTransactions).values({
    id: nanoid(12),
    userId,
    points,
    type: "EARN",
    description,
    orderId: orderId || null,
  });

  return { points: newPoints, level: newLevel };
}

export async function getLoyaltyStatus(userId: string) {
  const record = await db
    .select()
    .from(loyaltyPoints)
    .where(eq(loyaltyPoints.userId, userId))
    .limit(1);

  if (!record.length) {
    return { points: 0, level: "Bronze", totalEarned: 0 };
  }
  return record[0];
}

export function getLevelMultiplier(level: string): number {
  return LEVELS[level as keyof typeof LEVELS]?.multiplier || 1;
}