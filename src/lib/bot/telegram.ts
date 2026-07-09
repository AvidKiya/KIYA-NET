export const runtime = "edge";

import { Bot } from "grammy";
import { getBotToken } from "./engine";

let cachedBot: Bot | null = null;

export async function getTelegramBot(): Promise<Bot | null> {
  if (cachedBot) return cachedBot;
  const token = await getBotToken("telegram");
  if (!token) return null;
  cachedBot = new Bot(token);
  return cachedBot;
}
