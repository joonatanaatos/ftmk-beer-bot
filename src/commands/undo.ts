import type { Bot } from "grammy";
import { prisma } from "../prisma";
import { DRINK_EMOJI, type DrinkType } from "../config";

export function registerUndoCommand(bot: Bot) {
  bot.command("eiku", async (ctx) => {
    const telegramId = ctx.from!.id.toString();
    const latest = await prisma.drinkEntry.findFirst({
      where: { userId: telegramId },
      orderBy: { createdAt: "desc" },
    });
    if (!latest) {
      await ctx.reply("Ei kirjauksia poistettavaksi!");
      return;
    }
    await prisma.drinkEntry.delete({ where: { id: latest.id } });
    await ctx.reply(
      `Peruttu! ${DRINK_EMOJI[latest.type as DrinkType] ?? ""} Viimeisin kirjaus poistettu.`,
    );
  });
}
