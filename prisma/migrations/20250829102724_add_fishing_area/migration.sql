-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "fishingAreaId" TEXT;

-- CreateTable
CREATE TABLE "FishingArea" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "centerLat" DOUBLE PRECISION NOT NULL,
    "centerLng" DOUBLE PRECISION NOT NULL,
    "radius" INTEGER NOT NULL DEFAULT 200,
    "description" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "postCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FishingArea_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FishingArea" ADD CONSTRAINT "FishingArea_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_fishingAreaId_fkey" FOREIGN KEY ("fishingAreaId") REFERENCES "FishingArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;
