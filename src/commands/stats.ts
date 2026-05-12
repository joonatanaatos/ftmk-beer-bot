import type { Bot } from "grammy";
import { prisma } from "../prisma";
import { calcEuros, shiftForOutput } from "../helpers";

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
      `📊 Käyttäjän ${user.username} tilastot:\n🍺 Kaljat: ${beers}\n🍹 Drinkit: ${drinks}\n🥃 Shotit: ${shots}\n🍷 Viinit: ${wines}\n🍦 Jätskitykset: ${iceCreams}\n💶 Yhteensä: ${euros}€`,
    );
  });

  bot.command("daystats", async (ctx) => {
    const entries = await prisma.drinkEntry.findMany({
      orderBy: { createdAt: "asc" },
    });

    if (entries.length === 0) {
      await ctx.reply("Ei vielä kirjauksia!");
      return;
    }

    const dayKeyFormatter = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const dayLabelFormatter = new Intl.DateTimeFormat("fi-FI", {
      timeZone: "Europe/Helsinki",
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });

    const byDay = new Map<
      string,
      {
        date: Date;
        beers: number;
        drinks: number;
        shots: number;
        iceCreams: number;
        wines: number;
      }
    >();

    for (const entry of entries) {
      const adjusted = shiftForOutput(entry.createdAt);
      const shifted = new Date(adjusted.getTime() - 6 * 60 * 60 * 1000);
      const key = dayKeyFormatter.format(shifted);
      let day = byDay.get(key);
      if (!day) {
        day = {
          date: shifted,
          beers: 0,
          drinks: 0,
          shots: 0,
          iceCreams: 0,
          wines: 0,
        };
        byDay.set(key, day);
      }
      if (entry.type === "BEER") day.beers++;
      else if (entry.type === "DRINK") day.drinks++;
      else if (entry.type === "SHOT") day.shots++;
      else if (entry.type === "ICE_CREAM") day.iceCreams++;
      else if (entry.type === "WINE") day.wines++;
    }

    const rows = Array.from(byDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, day]) => {
        const euros = calcEuros(
          day.beers,
          day.drinks,
          day.shots,
          day.iceCreams,
          day.wines,
        );
        const label = dayLabelFormatter.format(day.date);
        return `<b>${label}</b>\n🍺 ${day.beers} | 🍹 ${day.drinks} | 🥃 ${day.shots} | 🍷 ${day.wines} | 🍦 ${day.iceCreams} | 💶 ${euros}€`;
      });

    await ctx.reply(`📅 Päivätilastot:\n\n${rows.join("\n\n")}`, {
      parse_mode: "HTML",
    });
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
          `<b>${i + 1}. ${username}</b>\n🍺 ${beers} | 🍹 ${drinks} | 🥃 ${shots} | 🍷 ${wines} | 🍦 ${iceCreams} | 💶 ${euros}€`,
      );

    await ctx.reply(`📊 Rappio-tilastot:\n\n${rows.join("\n\n")}`, {
      parse_mode: "HTML",
    });
  });
}
