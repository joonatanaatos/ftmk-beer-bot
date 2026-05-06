import { Bot } from "grammy";

const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN;

if (!TG_BOT_TOKEN) {
  throw new Error("TG_BOT_TOKEN environment variable is not set");
}

export const bot = new Bot(TG_BOT_TOKEN);
