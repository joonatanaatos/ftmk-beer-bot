import { bot } from "./bot";
import { registerCommands, COMMAND_MENU } from "./commands";
import { logger } from "./logger";

registerCommands(bot);
await bot.api.setMyCommands(COMMAND_MENU);

logger.info("Bot starting...");
bot.catch((err) => {
  logger.error(`Unhandled error: ${err.message}`);
});
await bot.start();
