import type { Bot } from "grammy";
import { prisma } from "../prisma";
import { DRINK_EMOJI, type DrinkType } from "../config";
import { ensureUser, respondToEntry } from "../helpers";

const DRINKS: { command: string; type: DrinkType; label: string }[] = [
  { command: "kalja", type: "BEER", label: "Kalja" },
  { command: "drinkki", type: "DRINK", label: "Drinkki" },
  { command: "shotti", type: "SHOT", label: "Shotti" },
  { command: "jatski", type: "ICE_CREAM", label: "Jätski" },
];

export function registerDrinkCommands(bot: Bot) {
  for (const { command, type, label } of DRINKS) {
    bot.command(command, async (ctx) => {
      const telegramId = ctx.from!.id.toString();
      await ensureUser(telegramId, ctx.from!.username ?? "unknown");
      await prisma.drinkEntry.create({
        data: { userId: telegramId, type },
      });
      const count = await prisma.drinkEntry.count({
        where: { userId: telegramId, type },
      });
      await respondToEntry(
        ctx,
        `${label} kirjattu! Yhteensä: ${count} ${DRINK_EMOJI[type]}`,
      );
    });
  }
}
