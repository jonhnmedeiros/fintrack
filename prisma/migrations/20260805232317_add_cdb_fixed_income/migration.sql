-- AlterEnum: adiciona CDB ao tipo de ativo existente
ALTER TYPE "AssetType" ADD VALUE 'CDB';

-- CreateEnum
CREATE TYPE "FixedIncomeRateType" AS ENUM ('CDI_PERCENT', 'PREFIXADO', 'IPCA_PLUS');

-- AlterTable: campos específicos de renda fixa (nullable — não afeta ativos existentes)
ALTER TABLE "Asset" ADD COLUMN "rateType" "FixedIncomeRateType",
                     ADD COLUMN "rate" DECIMAL(65,30),
                     ADD COLUMN "maturityDate" TIMESTAMP(3),
                     ADD COLUMN "issuer" TEXT;
