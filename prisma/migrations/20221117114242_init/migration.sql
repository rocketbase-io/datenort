/*
  Warnings:

  - You are about to drop the column `resolutionHeight` on the `AssetMeta` table. All the data in the column will be lost.
  - You are about to drop the column `resolutionWidth` on the `AssetMeta` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AssetMeta" DROP COLUMN "resolutionHeight",
DROP COLUMN "resolutionWidth";

-- CreateTable
CREATE TABLE "Resolution" (
    "id" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "heigth" INTEGER NOT NULL,
    "assetMetaId" TEXT NOT NULL,

    CONSTRAINT "Resolution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Resolution_assetMetaId_key" ON "Resolution"("assetMetaId");

-- AddForeignKey
ALTER TABLE "Resolution" ADD CONSTRAINT "Resolution_assetMetaId_fkey" FOREIGN KEY ("assetMetaId") REFERENCES "AssetMeta"("id") ON DELETE CASCADE ON UPDATE CASCADE;
