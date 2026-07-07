export const runtime = "edge";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { walletTransactions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });

    const txs = await db.select().from(walletTransactions).where(eq(walletTransactions.userId, session.userId)).orderBy(desc(walletTransactions.createdAt)).limit(50);

    return NextResponse.json({ transactions: txs });
  } catch (error) {
    return NextResponse.json({ error: "خطا" }, { status: 500 });
  }
}
