import { Bot } from "grammy";
import { prisma } from "./prisma";

const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN;

if (!TG_BOT_TOKEN) {
  throw new Error("TG_BOT_TOKEN environment variable is not set");
}

const bot = new Bot(TG_BOT_TOKEN);

bot.command("kalja", async (ctx) => {
  const user = await prisma.user.upsert({
    where: { telegramId: ctx.from!.id.toString() },
    create: {
      telegramId: ctx.from!.id.toString(),
      username: ctx.from!.username ?? "unknown",
      beerCount: 1,
    },
    update: { beerCount: { increment: 1 } },
  });
  await ctx.reply(`Kalja kirjattu! Yhteensä: ${user.beerCount} 🍺`);
});

bot.command("drinkki", async (ctx) => {
  const user = await prisma.user.upsert({
    where: { telegramId: ctx.from!.id.toString() },
    create: {
      telegramId: ctx.from!.id.toString(),
      username: ctx.from!.username ?? "unknown",
      drinkCount: 1,
    },
    update: { drinkCount: { increment: 1 } },
  });
  await ctx.reply(`Drinkki kirjattu! Yhteensä: ${user.drinkCount} 🍹`);
});

bot.command("shotti", async (ctx) => {
  const user = await prisma.user.upsert({
    where: { telegramId: ctx.from!.id.toString() },
    create: {
      telegramId: ctx.from!.id.toString(),
      username: ctx.from!.username ?? "unknown",
      shotCount: 1,
    },
    update: { shotCount: { increment: 1 } },
  });
  await ctx.reply(`Shotti kirjattu! Yhteensä: ${user.shotCount} 🥃`);
});

bot.command("jätski", async (ctx) => {
  const user = await prisma.user.upsert({
    where: { telegramId: ctx.from!.id.toString() },
    create: {
      telegramId: ctx.from!.id.toString(),
      username: ctx.from!.username ?? "unknown",
      iceCreamCount: 1,
    },
    update: { iceCreamCount: { increment: 1 } },
  });
  await ctx.reply(`Jätski kirjattu! Yhteensä: ${user.iceCreamCount} 🍦`);
});

bot.command("stats", async (ctx) => {
  const user = await prisma.user.findUnique({
    where: { telegramId: ctx.from!.id.toString() },
  });
  if (!user) {
    await ctx.reply(
      "Ei vielä tilastoja. Käytä /kalja, /drinkki, /shotti tai /jätski!",
    );
    return;
  }
  await ctx.reply(
    `📊 Käyttäjän ${user.username} tilastot:\n🍺 Kaljat: ${user.beerCount}\n🍹 Drinkit: ${user.drinkCount}\n🥃 Shotit: ${user.shotCount}\n🍦 Jätskitykset: ${user.iceCreamCount}`,
  );
});

bot.start();
