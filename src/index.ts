import { Bot, InputFile } from "grammy";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { prisma } from "./prisma";

const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN;

if (!TG_BOT_TOKEN) {
  throw new Error("TG_BOT_TOKEN environment variable is not set");
}

const bot = new Bot(TG_BOT_TOKEN);

async function ensureUser(telegramId: string, username: string) {
  await prisma.user.upsert({
    where: { telegramId },
    create: { telegramId, username },
    update: {},
  });
}

bot.command("kalja", async (ctx) => {
  const telegramId = ctx.from!.id.toString();
  await ensureUser(telegramId, ctx.from!.username ?? "unknown");
  await prisma.drinkEntry.create({
    data: { userId: telegramId, type: "BEER" },
  });
  const count = await prisma.drinkEntry.count({
    where: { userId: telegramId, type: "BEER" },
  });
  await ctx.reply(`Kalja kirjattu! Yhteensä: ${count} 🍺`);
});

bot.command("drinkki", async (ctx) => {
  const telegramId = ctx.from!.id.toString();
  await ensureUser(telegramId, ctx.from!.username ?? "unknown");
  await prisma.drinkEntry.create({
    data: { userId: telegramId, type: "DRINK" },
  });
  const count = await prisma.drinkEntry.count({
    where: { userId: telegramId, type: "DRINK" },
  });
  await ctx.reply(`Drinkki kirjattu! Yhteensä: ${count} 🍹`);
});

bot.command("shotti", async (ctx) => {
  const telegramId = ctx.from!.id.toString();
  await ensureUser(telegramId, ctx.from!.username ?? "unknown");
  await prisma.drinkEntry.create({
    data: { userId: telegramId, type: "SHOT" },
  });
  const count = await prisma.drinkEntry.count({
    where: { userId: telegramId, type: "SHOT" },
  });
  await ctx.reply(`Shotti kirjattu! Yhteensä: ${count} 🥃`);
});

bot.command("jatski", async (ctx) => {
  const telegramId = ctx.from!.id.toString();
  await ensureUser(telegramId, ctx.from!.username ?? "unknown");
  await prisma.drinkEntry.create({
    data: { userId: telegramId, type: "ICE_CREAM" },
  });
  const count = await prisma.drinkEntry.count({
    where: { userId: telegramId, type: "ICE_CREAM" },
  });
  await ctx.reply(`Jätski kirjattu! Yhteensä: ${count} 🍦`);
});

bot.command("stats", async (ctx) => {
  const telegramId = ctx.from!.id.toString();
  const user = await prisma.user.findUnique({ where: { telegramId } });
  if (!user) {
    await ctx.reply(
      "Ei vielä tilastoja. Käytä /kalja, /drinkki, /shotti tai /jatski!",
    );
    return;
  }
  const [beers, drinks, shots, iceCreams] = await Promise.all([
    prisma.drinkEntry.count({ where: { userId: telegramId, type: "BEER" } }),
    prisma.drinkEntry.count({ where: { userId: telegramId, type: "DRINK" } }),
    prisma.drinkEntry.count({ where: { userId: telegramId, type: "SHOT" } }),
    prisma.drinkEntry.count({
      where: { userId: telegramId, type: "ICE_CREAM" },
    }),
  ]);
  await ctx.reply(
    `📊 Käyttäjän ${user.username} tilastot:\n🍺 Kaljat: ${beers}\n🍹 Drinkit: ${drinks}\n🥃 Shotit: ${shots}\n🍦 Jätskitykset: ${iceCreams}`,
  );
});

const COLORS = [
  "#e6194b",
  "#3cb44b",
  "#4363d8",
  "#f58231",
  "#911eb4",
  "#42d4f4",
  "#f032e6",
  "#bfef45",
];

bot.command("kuvaaja", async (ctx) => {
  const entries = await prisma.drinkEntry.findMany({
    orderBy: { createdAt: "asc" },
    include: { user: { select: { username: true } } },
  });

  if (entries.length === 0) {
    await ctx.reply("Ei vielä kirjauksia! 📊");
    return;
  }

  // Group entries by user and build cumulative time series
  const byUser = new Map<string, { x: number; y: number }[]>();
  const usernames = new Map<string, string>();

  for (const entry of entries) {
    const uid = entry.userId;
    usernames.set(uid, entry.user.username);
    if (!byUser.has(uid)) byUser.set(uid, []);
    const points = byUser.get(uid)!;
    const last = points[points.length - 1];
    const prev = last !== undefined ? last.y : 0;
    points.push({ x: entry.createdAt.getTime(), y: prev + 1 });
  }

  const datasets = Array.from(byUser.entries()).map(([uid, points], i) => ({
    label: usernames.get(uid) ?? uid,
    data: points,
    borderColor: COLORS[i % COLORS.length],
    backgroundColor: "transparent",
    stepped: "before" as const,
    pointRadius: 3,
  }));

  const renderer = new ChartJSNodeCanvas({
    width: 900,
    height: 500,
    backgroundColour: "white",
    plugins: { modern: ["chartjs-adapter-date-fns"] },
  });

  const buffer = await renderer.renderToBuffer({
    type: "line",
    data: { datasets },
    options: {
      scales: {
        x: {
          type: "time",
          time: { unit: "day", displayFormats: { day: "d.M." } },
          title: { display: true, text: "Aika" },
        },
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 },
          title: { display: true, text: "Yhteensä" },
        },
      },
    },
  });

  await ctx.replyWithPhoto(new InputFile(buffer, "kuvaaja.png"));
});

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
  const typeEmoji: Record<string, string> = {
    BEER: "🍺",
    DRINK: "🍹",
    SHOT: "🥃",
    ICE_CREAM: "🍦",
  };
  await ctx.reply(
    `Peruttu! ${typeEmoji[latest.type] ?? ""} Viimeisin kirjaus poistettu.`,
  );
});

// Set up command menu
await bot.api.setMyCommands([
  { command: "kalja", description: "Merkitse kalja 🍺" },
  { command: "drinkki", description: "Merkitse drinkki 🍹" },
  { command: "shotti", description: "Merkitse shotti 🥃" },
  { command: "jatski", description: "Merkitse jätski 🍦" },
  { command: "stats", description: "Näytä omat tilastot 📊" },
  { command: "kuvaaja", description: "Näyttää kaavion 📈" },
  { command: "eiku", description: "Poista viimeisin kirjaus" },
]);

bot.start();
