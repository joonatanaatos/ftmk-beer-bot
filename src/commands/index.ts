import type { Bot } from "grammy";
import { registerDrinkCommands } from "./drinks";
import { registerStatsCommands } from "./stats";
import { registerChartCommand } from "./chart";
import { registerUndoCommand } from "./undo";
import { registerStartCommand } from "./start";
import { logger } from "../logger";
import { IS_ACTIVE } from "../config";

const WRITE_COMMANDS = new Set([
  "kalja",
  "drinkki",
  "shotti",
  "jatski",
  "viini",
  "eiku",
]);

export function registerCommands(bot: Bot) {
  bot.use(async (ctx, next) => {
    if (ctx.message?.text?.startsWith("/")) {
      const command = ctx.message.text.split(" ")[0];
      const userId = ctx.from?.id ?? "unknown";
      const username = ctx.from?.username ?? "no-username";
      const chatId = ctx.chat?.id ?? "unknown";
      const chatType = ctx.chat?.type ?? "unknown";
      logger.info(
        `command=${command} user=${username}(${userId}) chat=${chatId}(${chatType})`,
      );
    }
    await next();
  });

  bot.use(async (ctx, next) => {
    if (IS_ACTIVE) {
      await next();
      return;
    }
    const text = ctx.message?.text;
    if (text?.startsWith("/")) {
      const cmd = text.slice(1).split(/[\s@]/)[0] ?? "";
      if (WRITE_COMMANDS.has(cmd)) {
        await ctx.reply("Loma loppu jo bro 🤨");
        return;
      }
    }
    await next();
  });

  registerDrinkCommands(bot);
  registerStatsCommands(bot);
  registerChartCommand(bot);
  registerUndoCommand(bot);
  registerStartCommand(bot);
}

export const COMMAND_MENU = [
  { command: "start", description: "Aloita botin käyttö 🍻" },
  { command: "kalja", description: "Merkitse kalja 🍺" },
  { command: "drinkki", description: "Merkitse drinkki 🍹" },
  { command: "shotti", description: "Merkitse shotti 🥃" },
  { command: "viini", description: "Merkitse viini 🍷" },
  { command: "jatski", description: "Merkitse jätski 🍦" },
  { command: "stats", description: "Näytä omat tilastot 📊" },
  { command: "kuvaaja", description: "Näyttä kaavio 📈" },
  { command: "eiku", description: "Poista viimeisin kirjaus" },
  { command: "rappio", description: "Näytä kaikkien tilastot 📊" },
  { command: "daystats", description: "Näytä päivätilastot 📅" },
  { command: "mystats", description: "Näytä omat päivätilastot 📅" },
  { command: "finalstats", description: "Näytä loppustilastot 🏁" },
];
