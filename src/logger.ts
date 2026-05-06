type Level = "INFO" | "WARN" | "ERROR";

function log(level: Level, message: string): void {
  console.log(`[${new Date().toISOString()}] [${level}] ${message}`);
}

export const logger = {
  info: (msg: string) => log("INFO", msg),
  warn: (msg: string) => log("WARN", msg),
  error: (msg: string) => log("ERROR", msg),
};
