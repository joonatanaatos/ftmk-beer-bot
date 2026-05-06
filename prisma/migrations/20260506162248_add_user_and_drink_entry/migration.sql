-- CreateEnum
CREATE TYPE "DrinkType" AS ENUM ('BEER', 'DRINK', 'SHOT', 'ICE_CREAM');

-- CreateTable
CREATE TABLE "DrinkEntry" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "DrinkType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DrinkEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "telegramId" TEXT NOT NULL,
    "username" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("telegramId")
);

-- AddForeignKey
ALTER TABLE "DrinkEntry" ADD CONSTRAINT "DrinkEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("telegramId") ON DELETE RESTRICT ON UPDATE CASCADE;
