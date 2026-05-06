import { Bot, InputFile } from "grammy";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { prisma } from "./prisma";

const PRICES = {
  BEER: 4,
  DRINK: 5,
  SHOT: 3,
  ICE_CREAM: 2,
};

const MOTIVATIONAL_MESSAGES = [
  "Jatka samaan malliin! 🍻",
  "Olet todellinen taistelija! 🥳",
  "Uuteen nousuun! 🚀",
  "Jokainen kalja lasketaan! 🍻",
  "JESSSS! 💯",
  "Huhhuh, mikä saldo! 😎",
  "Onnistut paremmin kuin muut! 🌟",
  "Pidä hyvä tahti yllä! 🏃‍♂️",
  "Olet todellinen kaljaguru! 🍺",
  "Jokainen drinkki on drinkki kohti voittoa! 🍹",
  "Shotti päivässä pitää rapakon loitolla! 🥃",
  "Älä anna krapulan iskeä! 🍦",
  "Et tuota Daddylle pettymystä! 👑",
  "Taas mennään! 🚀",
  "Kellota! ⏱️",
  "Juot kuin koneteekkari! 🤖",
  "Tämä on elämäntapa! 🌈",
  "Olet FTMK:n ylpeys! 🎓",
  "Näytä niille fukseille! 💪",
  "Iuventus in aeternum! 🎓",
  "Näytä muna! 🍆",
];

const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN;

if (!TG_BOT_TOKEN) {
  throw new Error("TG_BOT_TOKEN environment variable is not set");
}

const bot = new Bot(TG_BOT_TOKEN);

function calcEuros(
  beers: number,
  drinks: number,
  shots: number,
  iceCreams: number,
) {
  return (
    beers * PRICES.BEER +
    drinks * PRICES.DRINK +
    shots * PRICES.SHOT +
    iceCreams * PRICES.ICE_CREAM
  );
}

async function ensureUser(telegramId: string, username: string) {
  await prisma.user.upsert({
    where: { telegramId },
    create: { telegramId, username },
    update: {},
  });
}

async function sendMotivationalMessage(ctx: any) {
  const message =
    MOTIVATIONAL_MESSAGES[
      Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)
    ];
  await ctx.reply(message);
}

async function respondToEntry(ctx: any, message: string) {
  if (Math.random() < 0.25) {
    await sendMotivationalMessage(ctx);
  } else {
    await ctx.reply(message);
  }
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
  await respondToEntry(ctx, `Kalja kirjattu! Yhteensä: ${count} 🍺`);
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
  await respondToEntry(ctx, `Drinkki kirjattu! Yhteensä: ${count} 🍹`);
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
  await respondToEntry(ctx, `Shotti kirjattu! Yhteensä: ${count} 🥃`);
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
  await respondToEntry(ctx, `Jätski kirjattu! Yhteensä: ${count} 🍦`);
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
  const euros = calcEuros(beers, drinks, shots, iceCreams);
  await ctx.reply(
    `📊 Käyttäjän ${user.username} tilastot:\n🍺 Kaljat: ${beers}\n🍹 Drinkit: ${drinks}\n🥃 Shotit: ${shots}\n🍦 Jätskitykset: ${iceCreams}\n💶 Yhteensä: ${euros}€`,
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
    const price = PRICES[entry.type as keyof typeof PRICES] ?? 0;
    const points = byUser.get(uid)!;
    const last = points[points.length - 1];
    const prev = last !== undefined ? last.y : 0;
    points.push({ x: entry.createdAt.getTime(), y: prev + price });
  }

  const datasets = Array.from(byUser.entries())
    .sort(
      ([, a], [, b]) => (b[b.length - 1]?.y ?? 0) - (a[a.length - 1]?.y ?? 0),
    )
    .map(([uid, points], i) => ({
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
          title: { display: true, text: "Dokattu summa (€)" },
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
      const euros = calcEuros(beers, drinks, shots, iceCreams);
      return {
        username: user.username,
        beers,
        drinks,
        shots,
        iceCreams,
        euros,
      };
    })
    .sort((a, b) => b.euros - a.euros)
    .map(
      ({ username, beers, drinks, shots, iceCreams, euros }, i) =>
        `<b>${i + 1}. ${username}</b>\n🍺 ${beers} | 🍹 ${drinks} | 🥃 ${shots} | 🍦 ${iceCreams} | 💶 ${euros}€`,
    );

  await ctx.reply(`📊 Rappio-tilastot:\n\n${rows.join("\n\n")}`, {
    parse_mode: "HTML",
  });
});

// Set up command menu
await bot.api.setMyCommands([
  { command: "kalja", description: "Merkitse kalja 🍺" },
  { command: "drinkki", description: "Merkitse drinkki 🍹" },
  { command: "shotti", description: "Merkitse shotti 🥃" },
  { command: "jatski", description: "Merkitse jätski 🍦" },
  { command: "stats", description: "Näytä omat tilastot 📊" },
  { command: "kuvaaja", description: "Näyttä kaavio 📈" },
  { command: "eiku", description: "Poista viimeisin kirjaus" },
  { command: "rappio", description: "Näytä kaikkien tilastot 📊" },
]);

bot.start();
