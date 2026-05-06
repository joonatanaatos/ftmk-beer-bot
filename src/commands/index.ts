import type { Bot } from "grammy";
import { registerDrinkCommands } from "./drinks";
import { registerStatsCommands } from "./stats";
import { registerChartCommand } from "./chart";
import { registerUndoCommand } from "./undo";

export function registerCommands(bot: Bot) {
  registerDrinkCommands(bot);
  registerStatsCommands(bot);
  registerChartCommand(bot);
  registerUndoCommand(bot);
}

export const COMMAND_MENU = [
  { command: "kalja", description: "Merkitse kalja 🍺" },
  { command: "drinkki", description: "Merkitse drinkki 🍹" },
  { command: "shotti", description: "Merkitse shotti 🥃" },
  { command: "jatski", description: "Merkitse jätski 🍦" },
  { command: "stats", description: "Näytä omat tilastot 📊" },
  { command: "kuvaaja", description: "Näyttä kaavio 📈" },
  { command: "eiku", description: "Poista viimeisin kirjaus" },
  { command: "rappio", description: "Näytä kaikkien tilastot 📊" },
];
