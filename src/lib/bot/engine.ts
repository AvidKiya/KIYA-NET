export const runtime = "edge";

import { Bot } from "grammy";
import { db } from "@/db";
import { users, orders, services, systemSettings, walletTransactions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { createToken } from "@/lib/auth";
import { nanoid } from "nanoid";

export type BotPlatform = "telegram" | "bale";

export async function getBotToken(platform: BotPlatform): Promise<string | null> {
  const key = platform === "telegram" ? "TELEGRAM_BOT_TOKEN" : "BALE_BOT_TOKEN";
  const rows = await db
    .select({ value: systemSettings.value })
    .from(systemSettings)
    .where(eq(systemSettings.key, key))
    .limit(1);
  return rows[0]?.value || null;
}

export async function setBotToken(platform: BotPlatform, token: string) {
  const key = platform === "telegram" ? "TELEGRAM_BOT_TOKEN" : "BALE_BOT_TOKEN";
  await db
    .insert(systemSettings)
    .values({ key, value: token, isConfigured: true, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: systemSettings.key,
      set: { value: token, isConfigured: true, updatedAt: new Date() },
    });
}

export async function setWebhookUrl(platform: BotPlatform, publicUrl: string) {
  const token = await getBotToken(platform);
  if (!token) throw new Error("Bot token not configured");

  const path = platform === "telegram" ? "api/bot/telegram/webhook" : "api/bot/bale/webhook";
  const webhookUrl = `${publicUrl.replace(/\/$/, "")}/${path}`;
  const apiBase = platform === "telegram" ? "https://api.telegram.org" : "https://tapi.bale.ai";

  const res = await fetch(`${apiBase}/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: webhookUrl,
      allowed_updates: ["message", "callback_query"],
    }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.ok) {
    throw new Error(json.description || `Failed to set ${platform} webhook`);
  }
  return { ok: true, webhookUrl };
}

export async function testBotToken(platform: BotPlatform) {
  const token = await getBotToken(platform);
  if (!token) throw new Error("Bot token not configured");

  const apiBase = platform === "telegram" ? "https://api.telegram.org" : "https://tapi.bale.ai";
  const res = await fetch(`${apiBase}/bot${token}/getMe`);
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.ok) {
    throw new Error(json.description || `Invalid ${platform} bot token`);
  }
  return { ok: true, bot: json.result };
}

async function textToBase64(text: string) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function encodeToArrayBuffer(text: string): ArrayBuffer {
  const bytes = new TextEncoder().encode(text);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

async function hmacSha256(key: Uint8Array, data: string) {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    toArrayBuffer(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encodeToArrayBuffer(data));
  return new Uint8Array(signature);
}

async function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function validateMiniAppInitData(platform: BotPlatform, initData: string, maxAgeSeconds = 86400) {
  const token = await getBotToken(platform);
  if (!token) throw new Error("Bot token not configured");

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) throw new Error("Missing hash");

  const authDate = params.get("auth_date");
  if (!authDate) throw new Error("Missing auth_date");
  const now = Math.floor(Date.now() / 1000);
  if (now - parseInt(authDate, 10) > maxAgeSeconds) {
    throw new Error("Init data expired");
  }

  const pairs: string[] = [];
  for (const [key, value] of params.entries()) {
    if (key !== "hash") pairs.push(`${key}=${value}`);
  }
  pairs.sort();
  const dataCheckString = pairs.join("\n");

  const secretKey = await hmacSha256(new TextEncoder().encode("WebAppData"), token);
  const calculatedHash = await hmacSha256(secretKey, dataCheckString);
  const calculatedHashHex = await bytesToHex(calculatedHash);

  if (calculatedHashHex !== hash.toLowerCase()) {
    throw new Error("Invalid init data hash");
  }

  const userJson = params.get("user");
  if (!userJson) throw new Error("Missing user data");
  const user = JSON.parse(userJson) as {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    phone_number?: string;
  };

  return { user };
}

async function findOrCreateUserByChat(platform: BotPlatform, chatId: string, chatUsername?: string) {
  const chatField = platform === "telegram" ? users.telegramChatId : users.baleChatId;
  const existing = await db
    .select()
    .from(users)
    .where(eq(chatField, chatId))
    .limit(1)
    .then((r) => r[0]);

  if (existing) return existing;

  // Try to find by predefined admin identifier (chat id as fallback identifier)
  const predefined = await db
    .select()
    .from(users)
    .where(eq(users.phoneNumber, chatId))
    .limit(1)
    .then((r) => r[0]);
  if (predefined) {
    await db
      .update(users)
      .set(platform === "telegram" ? { telegramChatId: chatId } : { baleChatId: chatId })
      .where(eq(users.id, predefined.id));
    return { ...predefined, [platform === "telegram" ? "telegramChatId" : "baleChatId"]: chatId };
  }

  const id = nanoid();
  const [created] = await db
    .insert(users)
    .values({
      id,
      phoneNumber: null,
      telegramChatId: platform === "telegram" ? chatId : null,
      baleChatId: platform === "bale" ? chatId : null,
      firstName: chatUsername || null,
      role: "CUSTOMER",
      walletBalance: "0",
      isActive: true,
    })
    .returning();
  return created;
}

function getMiniAppUrl(platform: BotPlatform, userId: string) {
  // Base URL is the same origin; mini app page is /miniapp
  if (typeof process === "undefined" || !process.env.NEXT_PUBLIC_APP_URL) {
    return `https://${platform}.miniapp/miniapp?u=${userId}`;
  }
  return `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}/miniapp?platform=${platform}&u=${userId}`;
}

export async function handleBotUpdate(platform: BotPlatform, update: any) {
  const message = update?.message || update?.callback_query?.message;
  if (!message || !message.chat) return;

  const chatId = String(message.chat.id);
  const text = update.message?.text || "";
  const username = update.message?.from?.first_name || update.callback_query?.from?.first_name || "";

  const user = await findOrCreateUserByChat(platform, chatId, username);

  if (text === "/start") {
    await sendBotMessage(platform, chatId, `سلام ${username || "کاربر عزیز"}! 👋\nبه ربات KIYA-NET خوش آمدید.\n\nبا دستورات زیر کار کنید:\n/orders - سفارشات من\n/wallet - موجودی کیف پول\n/support - پشتیبانی\n/miniapp - ورود به Mini App`);
    return;
  }

  if (text === "/help") {
    await sendBotMessage(platform, chatId, `راهنمای ربات:\n/orders - مشاهده سفارشات\n/wallet - موجودی و تراکنش‌ها\n/support - ارتباط با پشتیبانی\n/miniapp - ورود به Mini App`);
    return;
  }

  if (text === "/orders") {
    const userOrders = await db
      .select({
        id: orders.id,
        status: orders.status,
        totalAmount: orders.totalAmount,
        serviceName: services.serviceName,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .leftJoin(services, eq(orders.serviceId, services.id))
      .where(eq(orders.userId, user.id))
      .orderBy(desc(orders.createdAt))
      .limit(10);

    if (userOrders.length === 0) {
      await sendBotMessage(platform, chatId, "شما هنوز سفارشی ثبت نکرده‌اید.");
      return;
    }

    const lines = userOrders.map(
      (o, i) =>
        `${i + 1}. ${o.serviceName || "سفارش"} - ${o.status} - ${Number(o.totalAmount).toLocaleString("fa-IR")} تومان`
    );
    await sendBotMessage(platform, chatId, `سفارشات شما:\n${lines.join("\n")}`);
    return;
  }

  if (text === "/wallet") {
    const balance = Number(user.walletBalance || 0).toLocaleString("fa-IR");
    const txs = await db
      .select({ amount: walletTransactions.amount, type: walletTransactions.type, description: walletTransactions.description })
      .from(walletTransactions)
      .where(eq(walletTransactions.userId, user.id))
      .orderBy(desc(walletTransactions.createdAt))
      .limit(5);

    const txLines = txs.length
      ? txs.map((t) => `- ${t.type}: ${Number(t.amount).toLocaleString("fa-IR")} ${t.description || ""}`).join("\n")
      : "بدون تراکنش اخیر";

    await sendBotMessage(platform, chatId, `موجودی کیف پول: ${balance} تومان\n\n۵ تراکنش اخیر:\n${txLines}`);
    return;
  }

  if (text === "/support") {
    await sendBotMessage(platform, chatId, "برای پشتیبانی با شماره ۰۹۰۳۳۷۷۶۷۶۷ تماس بگیرید یا پیام خود را ارسال کنید.");
    return;
  }

  if (text === "/miniapp") {
    const url = getMiniAppUrl(platform, user.id);
    await sendBotMessage(platform, chatId, `برای ورود به Mini App روی لینک زیر بزنید:\n${url}`);
    return;
  }

  // Echo support messages
  await sendBotMessage(platform, chatId, "پیام شما دریافت شد. در صورت نیاز پشتیبانی با شما تماس خواهد گرفت.");
}

export async function sendBotMessage(platform: BotPlatform, chatId: string, text: string) {
  const token = await getBotToken(platform);
  if (!token) throw new Error("Bot token not configured");

  const apiBase = platform === "telegram" ? "https://api.telegram.org" : "https://tapi.bale.ai";
  const res = await fetch(`${apiBase}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.ok) {
    throw new Error(json.description || `Failed to send ${platform} message`);
  }
  return json.result;
}

export async function buildMiniAppSession(platform: BotPlatform, initData: string) {
  const { user } = await validateMiniAppInitData(platform, initData, 86400);
  const platformField = platform === "telegram" ? users.telegramChatId : users.baleChatId;
  const chatId = String(user.id);

  let dbUser = await db
    .select()
    .from(users)
    .where(eq(platformField, chatId))
    .limit(1)
    .then((r) => r[0]);

  if (!dbUser) {
    const id = nanoid();
    const [created] = await db
      .insert(users)
      .values({
        id,
        phoneNumber: user.phone_number || null,
        telegramChatId: platform === "telegram" ? chatId : null,
        baleChatId: platform === "bale" ? chatId : null,
        firstName: user.first_name || null,
        lastName: user.last_name || null,
        role: "CUSTOMER",
        walletBalance: "0",
        isActive: true,
      })
      .returning();
    dbUser = created;
  }

  const token = await createToken({
    userId: dbUser.id,
    role: dbUser.role,
    phoneNumber: dbUser.phoneNumber,
  });

  return { token, user: dbUser };
}
