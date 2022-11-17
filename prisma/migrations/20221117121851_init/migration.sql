/*
  Warnings:

  - You are about to drop the column `blurhash` on the `Asset` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "blurhash",
ADD COLUMN     "blurHash" TEXT;
