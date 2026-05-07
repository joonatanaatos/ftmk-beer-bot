import type { Bot } from "grammy";
import { prisma } from "../prisma";
import { calcEuros } from "../helpers";

export function registerStatsCommands(bot: Bot) {
  bot.command("stats", async (ctx) => {
    const telegramId = ctx.from!.id.toString();
    const user = await prisma.user.findUnique({ where: { telegramId } });
    if (!user) {
      await ctx.reply(
        "Ei vielä tilastoja. Käytä /kalja, /drinkki, /shotti, /jatski tai /viini!",
      );
      return;
    }
    const [beers, drinks, shots, iceCreams, wines] = await Promise.all([
      prisma.drinkEntry.count({ where: { userId: telegramId, type: "BEER" } }),
      prisma.drinkEntry.count({ where: { userId: telegramId, type: "DRINK" } }),
      prisma.drinkEntry.count({ where: { userId: telegramId, type: "SHOT" } }),
      prisma.drinkEntry.count({
        where: { userId: telegramId, type: "ICE_CREAM" },
      }),
      prisma.drinkEntry.count({ where: { userId: telegramId, type: "WINE" } }),
    ]);
    const euros = calcEuros(beers, drinks, shots, iceCreams, wines);
    await ctx.reply(
      `📊 Käyttäjän ${user.username} tilastot:\n🍺 Kaljat: ${beers}\n🍹 Drinkit: ${drinks}\n🥃 Shotit: ${shots}\n🍦 Jätskitykset: ${iceCreams}\n🍷 Viinit: ${wines}\n💶 Yhteensä: ${euros}€`,
    );
  });

  bot.command("rappio", async (ctx) => {
    const users = await prisma.user.findMany({
      include: { entries: true },
    });

    if (users.length === 0) {
      await ctx.reply("Ei vielä kirjauksia!");
      return;
    }

    const rows = users
      .map((user) => {
        const beers = user.entries.filter((e) => e.type === "BEER").length;
        const drinks = user.entries.filter((e) => e.type === "DRINK").length;
        const shots = user.entries.filter((e) => e.type === "SHOT").length;
        const iceCreams = user.entries.filter(
          (e) => e.type === "ICE_CREAM",
        ).length;
        const wines = user.entries.filter((e) => e.type === "WINE").length;
        const euros = calcEuros(beers, drinks, shots, iceCreams, wines);
        return {
          username: user.username,
          beers,
          drinks,
          shots,
          iceCreams,
          wines,
          euros,
        };
      })
      .sort((a, b) => b.euros - a.euros)
      .map(
        ({ username, beers, drinks, shots, iceCreams, wines, euros }, i) =>
          `<b>${i + 1}. ${username}</b>\n🍺 ${beers} | 🍹 ${drinks} | 🥃 ${shots} | 🍦 ${iceCreams} | 🍷 ${wines} | 💶 ${euros}€`,
      );

    await ctx.reply(`📊 Rappio-tilastot:\n\n${rows.join("\n\n")}`, {
      parse_mode: "HTML",
    });
  });
}
