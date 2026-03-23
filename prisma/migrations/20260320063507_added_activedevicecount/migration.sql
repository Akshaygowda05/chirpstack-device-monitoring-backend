-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "activeDeviceCount" (
    "id" SERIAL NOT NULL,
    "applicationId" INTEGER NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "activeCount" INTEGER NOT NULL,
    "inactiveCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activeDeviceCount_pkey" PRIMARY KEY ("id")
);
