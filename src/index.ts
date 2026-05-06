import { bot } from "./bot";
import { registerCommands, COMMAND_MENU } from "./commands";

registerCommands(bot);
await bot.api.setMyCommands(COMMAND_MENU);
bot.start();
