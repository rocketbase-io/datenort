import { Asset } from "@prisma/client";
import { AssetFormatterService } from "../services/AssetFormatterService";

describe("AssetFormatterService", () => {
  let assetFormatterService: AssetFormatterService;

  beforeEach(() => {
    assetFormatterService = new AssetFormatterService();
  });

  describe("format", () => {
    it("should format an Asset object correctly", () => {
      const rawAsset : Asset = {
        id: "asset-id",
        type: "image",
        created: new Date(),
        originalFilename: "image.jpg",
        fileSize: 1024,
        analyzed: new Date(),
        download: "https://example.com/download",
        urlPath: "https://example.com/image.jpg",
        bucket: "asset-bucket",
        referenceUrl: "https://example.com/reference",
        colorPalette: {
          primary: "#ffffff",
          colors: ["#ffffff", "#000000"]
        },
        imageWidth: 800,
        imageHeight: 600,
        blurHash: "LHFHLR-LHFHLR"
      };

      const expectedFormattedAsset = {
        id: "asset-id",
        type: "image",
        created: rawAsset.created,
        originalFilename: "image.jpg",
        fileSize: "1KB",
        analyzed: rawAsset.analyzed,
        download: "https://example.com/download",
        urlPath: "https://example.com/image.jpg",
        bucket: "asset-bucket",
        referenceUrl: "https://example.com/reference",
        imageData: {
          blurHash: "LHFHLR-LHFHLR",
          colorPalette: {
            primary: "#ffffff",
            colors: ["#ffffff", "#000000"]
          },
          resolution: {
            width: 800,
            height: 600
          }
        }
      };

      const formattedAsset = assetFormatterService.format(rawAsset);
      expect(formattedAsset).toEqual(expectedFormattedAsset);
    });
  });
});
