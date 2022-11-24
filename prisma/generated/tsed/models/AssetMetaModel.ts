import { AssetMeta } from "../client";
import { Required, Property, Format, Integer, Allow } from "@tsed/schema";
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

  @Property(Object)
  @Allow(null)
  resolution: any | null;

  @Property(Object)
  @Allow(null)
  colorPalette: any | null;

  @Property(() => AssetModel)
  @Allow(null)
  asset: AssetModel | null;

  @Property(String)
  @Required()
  assetId: string;
}

