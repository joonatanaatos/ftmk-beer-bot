import type { Context } from "grammy";
import { prisma } from "./prisma";
import { MOTIVATIONAL_MESSAGES, PRICES, TIME_OFFSET_MS } from "./config";

export function shiftForOutput(date: Date): Date {
  return new Date(date.getTime() + TIME_OFFSET_MS);
}

export function calcEuros(
  beers: number,
  drinks: number,
  shots: number,
  iceCreams: number,
  wines: number,
) {
  return (
    beers * PRICES.BEER +
    drinks * PRICES.DRINK +
    shots * PRICES.SHOT +
    iceCreams * PRICES.ICE_CREAM +
    wines * PRICES.WINE
  );
}

export async function ensureUser(telegramId: string, username: string) {
  await prisma.user.upsert({
    where: { telegramId },
    create: { telegramId, username },
    update: {},
  });
}

export async function sendMotivationalMessage(ctx: Context) {
  const message =
    MOTIVATIONAL_MESSAGES[
      Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)
    ];
  await ctx.reply(message!);
}

export async function respondToEntry(ctx: Context, message: string) {
  if (Math.random() < 0.2) {
    await sendMotivationalMessage(ctx);
  } else {
    await ctx.reply(message);
  }
}
