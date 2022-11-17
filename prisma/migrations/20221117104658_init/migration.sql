-- CreateTable
CREATE TABLE "ColorPalette" (
    "id" TEXT NOT NULL,
    "primary" TEXT NOT NULL,
    "colors" TEXT[],
    "assetMetaId" TEXT NOT NULL,

    CONSTRAINT "ColorPalette_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ColorPalette_assetMetaId_key" ON "ColorPalette"("assetMetaId");

-- AddForeignKey
ALTER TABLE "ColorPalette" ADD CONSTRAINT "ColorPalette_assetMetaId_fkey" FOREIGN KEY ("assetMetaId") REFERENCES "AssetMeta"("id") ON DELETE CASCADE ON UPDATE CASCADE;
