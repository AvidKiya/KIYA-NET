// Auto-cancel orders after a certain time (for Cloudflare Cron or API)
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq, and, lt } from "drizzle-orm";

export async function autoCancelStaleOrders(hours = 72) {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);

  const staleOrders = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.status, "PENDING_ASSIGNMENT"),
        lt(orders.createdAt, cutoff)
      )
    );

  let cancelledCount = 0;

  for (const order of staleOrders) {
    await db
      .update(orders)
      .set({
        status: "CANCELLED",
        adminNotes: `خودکار لغو شد (بیش از ${hours} ساعت بدون اقدام)`,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id));

    cancelledCount++;
  }

  return { cancelled: cancelledCount, total: staleOrders.length };
}