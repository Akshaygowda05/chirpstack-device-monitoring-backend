/*
  Warnings:

  - Added the required column `batteryVoltage` to the `RobotData` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_applicationId_fkey";

-- AlterTable
ALTER TABLE "RobotData" ADD COLUMN     "batteryVoltage" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "siteName" TEXT,
ALTER COLUMN "applicationId" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "SchedularData" (
    "id" SERIAL NOT NULL,
    "time" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "groupName" TEXT[],
    "groupId" TEXT[],
    "applicationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchedularData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RobotData_deviceId_idx" ON "RobotData"("deviceId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ChirpstackApplication"("chirpstackId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchedularData" ADD CONSTRAINT "SchedularData_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ChirpstackApplication"("chirpstackId") ON DELETE CASCADE ON UPDATE CASCADE;
