import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";
import { logger } from "./logger";

logger.info("Initializing Prisma client...");
const connectionString = `prisma+postgresql://${process.env["POSTGRES_USER"]!}:${process.env["POSTGRES_PASSWORD"]!}@${process.env["POSTGRES_HOST"]!}:${process.env["POSTGRES_PORT"]!}/${process.env["POSTGRES_DB"]!}`;

logger.info(
  `Connecting to database: postgres://<user>:<password>@${process.env["POSTGRES_HOST"]!}:${process.env["POSTGRES_PORT"]!}/${process.env["POSTGRES_DB"]!}`,
);
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

logger.info("Prisma client initialized successfully");

export { prisma };
