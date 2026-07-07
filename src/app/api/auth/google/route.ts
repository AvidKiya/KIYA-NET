export const runtime = "edge";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { createToken, setSessionCookie } from "@/lib/auth";

export async function GET() {
  try {
    // In production, this would redirect to Google OAuth consent screen
    // and handle the callback with real token exchange.
    // For now: create/update user with a google-authenticated flag and redirect.

    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_BASE_URL
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`
      : "http://localhost:3000/api/auth/google/callback";

    if (googleClientId) {
      // Real OAuth flow
      const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile&prompt=select_account`;
      return NextResponse.redirect(url);
    }

    // Development/demo: auto-create a Google-linked user
    const demoEmail = "demo@kiyanet.ir";
    const demoName = "کاربر گوگل";

    let user = await db.select().from(users).where(eq(users.email, demoEmail)).limit(1).then(r => r[0]);

    if (!user) {
      const userId = uuid();
      await db.insert(users).values({
        id: userId,
        email: demoEmail,
        phoneNumber: "09" + Math.floor(100000000 + Math.random() * 900000000).toString(),
        firstName: demoName,
        role: "CUSTOMER",
        walletBalance: "0",
        referralCode: "KIYA" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      });
      user = await db.select().from(users).where(eq(users.id, userId)).limit(1).then(r => r[0]);
    }

    if (user) {
      const token = await createToken({ userId: user.id, role: user.role, phoneNumber: user.phoneNumber });
      await setSessionCookie(token);
    }

    return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"));
  } catch (error) {
    console.error("Google auth error:", error);
    return NextResponse.redirect(new URL("/login?error=google", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"));
  }
}
