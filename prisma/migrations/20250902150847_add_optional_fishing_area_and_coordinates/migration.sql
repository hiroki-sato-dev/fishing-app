-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_fishingAreaId_fkey";

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ALTER COLUMN "fishingAreaId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_fishingAreaId_fkey" FOREIGN KEY ("fishingAreaId") REFERENCES "FishingArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;
