-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "RobotData" (
    "id" SERIAL NOT NULL,
    "deviceId" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL,
    "block" TEXT,
    "panelsCleaned" INTEGER NOT NULL,
    "rawOdometerValue" BIGINT NOT NULL,
    "batteryDischargeCycle" DOUBLE PRECISION NOT NULL,
    "manualCount" INTEGER NOT NULL DEFAULT 0,
    "autoCount" INTEGER NOT NULL DEFAULT 0,
    "applicationId" INTEGER NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RobotData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "applicationId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChirpstackApplication" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "applicationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChirpstackApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RobotData_deviceId_createdAt_idx" ON "RobotData"("deviceId", "createdAt");

-- CreateIndex
CREATE INDEX "RobotData_applicationId_idx" ON "RobotData"("applicationId");

-- CreateIndex
CREATE INDEX "RobotData_tenantId_idx" ON "RobotData"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ChirpstackApplication_applicationId_key" ON "ChirpstackApplication"("applicationId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ChirpstackApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;
