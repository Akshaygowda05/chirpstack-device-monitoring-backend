-- DropForeignKey
ALTER TABLE "SiteConfiguration" DROP CONSTRAINT "SiteConfiguration_applicationId_fkey";

-- AlterTable
ALTER TABLE "SiteConfiguration" ALTER COLUMN "applicationId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "SiteConfiguration" ADD CONSTRAINT "SiteConfiguration_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ChirpstackApplication"("chirpstackId") ON DELETE CASCADE ON UPDATE CASCADE;
