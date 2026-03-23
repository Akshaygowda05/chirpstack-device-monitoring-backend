-- DropIndex
DROP INDEX "RobotData_deviceId_createdAt_idx";

-- AlterTable
ALTER TABLE "activeDeviceCount" ALTER COLUMN "applicationId" SET DATA TYPE TEXT;

-- CreateIndex
CREATE INDEX "RobotData_createdAt_deviceId_idx" ON "RobotData"("createdAt", "deviceId");

-- CreateIndex
CREATE INDEX "activeDeviceCount_applicationId_idx" ON "activeDeviceCount"("applicationId");
