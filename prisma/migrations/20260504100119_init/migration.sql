/*
  Warnings:

  - You are about to drop the column `autoCount` on the `RobotData` table. All the data in the column will be lost.
  - You are about to drop the column `manualCount` on the `RobotData` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `RobotData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RobotData" DROP COLUMN "autoCount",
DROP COLUMN "manualCount",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Runningata" (
    "id" SERIAL NOT NULL,
    "applicationId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "autoCount" INTEGER NOT NULL DEFAULT 0,
    "manualCount" INTEGER NOT NULL DEFAULT 0,
    "TotalmanualCount" INTEGER NOT NULL DEFAULT 0,
    "TotalautoCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Runningata_pkey" PRIMARY KEY ("id")
);
