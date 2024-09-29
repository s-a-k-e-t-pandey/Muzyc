/*
  Warnings:

  - You are about to drop the column `bigImg` on the `Upvote` table. All the data in the column will be lost.
  - You are about to drop the column `smallImg` on the `Upvote` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Upvote` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Upvote" DROP CONSTRAINT "Upvote_streamId_fkey";

-- AlterTable
ALTER TABLE "Stream" ADD COLUMN     "bigImg" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "smallImg" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "title" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Upvote" DROP COLUMN "bigImg",
DROP COLUMN "smallImg",
DROP COLUMN "title";

-- DropEnum
DROP TYPE "Role";

-- AddForeignKey
ALTER TABLE "Upvote" ADD CONSTRAINT "Upvote_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "Stream"("id") ON DELETE CASCADE ON UPDATE CASCADE;
