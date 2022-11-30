-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "bucket" TEXT NOT NULL DEFAULT 'test',
ADD COLUMN     "download" TEXT,
ADD COLUMN     "previews" JSONB;

-- AlterTable
ALTER TABLE "AssetMeta" ALTER COLUMN "referenceUrl" DROP NOT NULL;
