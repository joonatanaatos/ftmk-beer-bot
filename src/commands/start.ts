import type { Bot } from "grammy";
import { COMMAND_MENU } from "./index";

export function registerStartCommand(bot: Bot) {
  bot.command("start", async (ctx) => {
    const commandList = COMMAND_MENU
      .filter(({ command }) => command !== "start")
      .map(({ command, description }) => `/${command} – ${description}`)
      .join("\n");

    const message =
      "Tervetuloa rappiolle, kanssajuoppo! 🍻\n" +
      "Olen FTMK-kaljabotti, virallinen humalan kirjanpitäjä.\n\n" +
      "Tässä komennot, joilla pidetään tilastot kunnossa:\n\n" +
      `${commandList}\n\n` +
      "Nyt on aika pistää känni päälle! 🍻🥃🍹";

    await ctx.reply(message);
  });
}
