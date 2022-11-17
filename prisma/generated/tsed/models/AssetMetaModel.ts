import { AssetMeta } from "../client";
import { Required, Property, Format, Integer, Allow } from "@tsed/schema";
import { ResolutionModel } from "./ResolutionModel";
import { ColorPaletteModel } from "./ColorPaletteModel";
import { AssetModel } from "./AssetModel";

export class AssetMetaModel implements AssetMeta {
  @Property(String)
  @Required()
  id: string;

  @Property(Date)
  @Format("date-time")
  @Required()
  created: Date;

  @Property(String)
  @Required()
  originalFilename: string;

  @Property(Number)
  @Integer()
  @Required()
  fileSize: number;

  @Property(String)
  @Required()
  referenceUrl: string;

  @Property(() => ResolutionModel)
  @Allow(null)
  resolution: ResolutionModel | null;

  @Property(() => ColorPaletteModel)
  @Allow(null)
  colorPalette: ColorPaletteModel | null;

  @Property(() => AssetModel)
  @Allow(null)
  asset: AssetModel | null;

  @Property(String)
  @Required()
  assetId: string;
}

