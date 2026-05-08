import { type Bot, InputFile } from "grammy";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { prisma } from "../prisma";
import { COLORS, PRICES, type DrinkType } from "../config";
import { shiftForOutput } from "../helpers";

export function registerChartCommand(bot: Bot) {
  bot.command("kuvaaja", async (ctx) => {
    const entries = await prisma.drinkEntry.findMany({
      orderBy: { createdAt: "asc" },
      include: { user: { select: { username: true } } },
    });

    if (entries.length === 0) {
      await ctx.reply("Ei vielä kirjauksia! 📊");
      return;
    }

    const byUser = new Map<string, { x: number; y: number }[]>();
    const usernames = new Map<string, string>();

    for (const entry of entries) {
      const uid = entry.userId;
      usernames.set(uid, entry.user.username);
      if (!byUser.has(uid)) byUser.set(uid, []);
      const price = PRICES[entry.type as DrinkType] ?? 0;
      const points = byUser.get(uid)!;
      const last = points[points.length - 1];
      const prev = last !== undefined ? last.y : 0;
      points.push({
        x: shiftForOutput(entry.createdAt).getTime(),
        y: prev + price,
      });
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
}
