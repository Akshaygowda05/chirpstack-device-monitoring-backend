/*
  Warnings:

  - You are about to drop the column `multiplicationFactor` on the `ChirpstackApplication` table. All the data in the column will be lost.
  - You are about to drop the column `pannelWidth` on the `ChirpstackApplication` table. All the data in the column will be lost.
  - You are about to drop the column `pannlesGaps` on the `ChirpstackApplication` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "blocktriggering" AS ENUM ('UNICAST', 'MULTICAST', 'BOTH');

-- AlterTable
ALTER TABLE "ChirpstackApplication" DROP COLUMN "multiplicationFactor",
DROP COLUMN "pannelWidth",
DROP COLUMN "pannlesGaps";

-- CreateTable
CREATE TABLE "siteConfiguration" (
    "id" SERIAL NOT NULL,
    "pannelWidth" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "pannlesGaps" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "multiplicationFactor" INTEGER NOT NULL DEFAULT 1,
    "triggeringAction" "blocktriggering" NOT NULL DEFAULT 'UNICAST',
    "sendTwiceAday" BOOLEAN NOT NULL DEFAULT false,
    "applicationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "siteConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "siteConfiguration_applicationId_key" ON "siteConfiguration"("applicationId");

-- AddForeignKey
ALTER TABLE "siteConfiguration" ADD CONSTRAINT "siteConfiguration_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ChirpstackApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
