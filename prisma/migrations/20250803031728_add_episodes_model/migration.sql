-- AlterTable
ALTER TABLE "movies" ALTER COLUMN "videoUrl" DROP NOT NULL;

-- CreateTable
CREATE TABLE "episodes" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "episodeNumber" INTEGER NOT NULL,
    "season" INTEGER NOT NULL DEFAULT 1,
    "duration" TEXT,
    "videoUrl" TEXT NOT NULL,
    "imageUrl" TEXT,
    "movieId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "episodes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "episodes_movieId_season_episodeNumber_key" ON "episodes"("movieId", "season", "episodeNumber");

-- AddForeignKey
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
