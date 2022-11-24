/*
  Warnings:

  - You are about to drop the `ColorPalette` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Resolution` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ColorPalette" DROP CONSTRAINT "ColorPalette_assetMetaId_fkey";

-- DropForeignKey
ALTER TABLE "Resolution" DROP CONSTRAINT "Resolution_assetMetaId_fkey";

-- DropIndex
DROP INDEX "Asset_urlPath_key";

-- AlterTable
ALTER TABLE "AssetMeta" ADD COLUMN     "colorPalette" JSONB,
ADD COLUMN     "resolution" JSONB;

-- DropTable
DROP TABLE "ColorPalette";

-- DropTable
DROP TABLE "Resolution";
