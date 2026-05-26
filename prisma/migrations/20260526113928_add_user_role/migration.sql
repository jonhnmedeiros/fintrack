-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('TITULAR', 'VISUALIZADOR');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'TITULAR';
