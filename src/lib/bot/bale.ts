export const runtime = "edge";

import { getBotToken, handleBotUpdate, sendBotMessage, type BotPlatform } from "./engine";

export const BALE_API_BASE = "https://tapi.bale.ai";

export class BaleBot {
  platform: BotPlatform = "bale";

  async init() {
    const token = await getBotToken("bale");
    return !!token;
  }

  async handleUpdate(update: unknown) {
    return handleBotUpdate("bale", update);
  }

  async sendMessage(chatId: string, text: string) {
    return sendBotMessage("bale", chatId, text);
  }
}

let cachedBaleBot: BaleBot | null = null;

export async function getBaleBot(): Promise<BaleBot | null> {
  if (cachedBaleBot) return cachedBaleBot;
  const bot = new BaleBot();
  const ok = await bot.init();
  if (!ok) return null;
  cachedBaleBot = bot;
  return bot;
}
