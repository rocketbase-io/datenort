-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "urlPath" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetMeta" (
    "id" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "originalFilename" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "referenceUrl" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,

    CONSTRAINT "AssetMeta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Asset_urlPath_key" ON "Asset"("urlPath");

-- CreateIndex
CREATE UNIQUE INDEX "AssetMeta_assetId_key" ON "AssetMeta"("assetId");

-- AddForeignKey
ALTER TABLE "AssetMeta" ADD CONSTRAINT "AssetMeta_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
