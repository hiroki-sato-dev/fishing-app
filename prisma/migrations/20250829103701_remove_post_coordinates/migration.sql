/*
  Warnings:

  - You are about to drop the column `latitude` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `Post` table. All the data in the column will be lost.
  - Made the column `fishingAreaId` on table `Post` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_fishingAreaId_fkey";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "latitude",
DROP COLUMN "longitude",
ALTER COLUMN "fishingAreaId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_fishingAreaId_fkey" FOREIGN KEY ("fishingAreaId") REFERENCES "FishingArea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
