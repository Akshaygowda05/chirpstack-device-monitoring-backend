/*
  Warnings:

  - Added the required column `tenantId` to the `ChirpstackApplication` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChirpstackApplication" ADD COLUMN     "tenantId" INTEGER NOT NULL;
