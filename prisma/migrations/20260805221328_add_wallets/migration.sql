-- CreateEnum
CREATE TYPE "WalletType" AS ENUM ('CHECKING', 'SAVINGS', 'INVESTMENT', 'CASH', 'OTHER');

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "WalletType" NOT NULL,
    "color" TEXT,
    "icon" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_name_key" ON "Wallet"("userId", "name");

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN "walletId" TEXT,
                           ADD COLUMN "toWalletId" TEXT;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_toWalletId_fkey" FOREIGN KEY ("toWalletId") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- DataMigration: cria uma "Conta Principal" para cada usuário que já tem
-- transações, e associa todas as transações existentes (sem conta) a ela.
INSERT INTO "Wallet" (id, name, type, "userId")
SELECT
    substr(md5(random()::text || clock_timestamp()::text || u.id), 1, 25),
    'Conta Principal',
    'OTHER',
    u.id
FROM "User" u
WHERE EXISTS (SELECT 1 FROM "Transaction" t WHERE t."userId" = u.id);

UPDATE "Transaction" t
SET "walletId" = w.id
FROM "Wallet" w
WHERE w."userId" = t."userId"
  AND w.name = 'Conta Principal'
  AND t."walletId" IS NULL;
