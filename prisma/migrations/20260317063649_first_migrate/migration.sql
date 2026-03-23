/*
  Warnings:

  - You are about to drop the column `applicationId` on the `ChirpstackApplication` table. All the data in the column will be lost.
  - You are about to drop the `siteConfiguration` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[chirpstackId]` on the table `ChirpstackApplication` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `chirpstackId` to the `ChirpstackApplication` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "siteConfiguration" DROP CONSTRAINT "siteConfiguration_applicationId_fkey";

-- DropIndex
DROP INDEX "ChirpstackApplication_applicationId_key";

-- AlterTable
ALTER TABLE "ChirpstackApplication" DROP COLUMN "applicationId",
ADD COLUMN     "chirpstackId" TEXT NOT NULL;

-- DropTable
DROP TABLE "siteConfiguration";

-- CreateTable
CREATE TABLE "ChirpstackTenant" (
    "id" SERIAL NOT NULL,
    "chirpstackId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChirpstackTenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteConfiguration" (
    "id" SERIAL NOT NULL,
    "panelWidth" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "panelsGap" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "multiplicationFactor" INTEGER NOT NULL DEFAULT 1,
    "triggeringAction" "blocktriggering" NOT NULL DEFAULT 'UNICAST',
    "sendTwiceAday" BOOLEAN NOT NULL DEFAULT false,
    "applicationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChirpstackTenant_chirpstackId_key" ON "ChirpstackTenant"("chirpstackId");

-- CreateIndex
CREATE UNIQUE INDEX "SiteConfiguration_applicationId_key" ON "SiteConfiguration"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "ChirpstackApplication_chirpstackId_key" ON "ChirpstackApplication"("chirpstackId");

-- AddForeignKey
ALTER TABLE "ChirpstackApplication" ADD CONSTRAINT "ChirpstackApplication_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "ChirpstackTenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteConfiguration" ADD CONSTRAINT "SiteConfiguration_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ChirpstackApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
