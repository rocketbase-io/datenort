import { Resolution } from "../client";
import { Required, Property, Integer, Allow } from "@tsed/schema";
import { AssetMetaModel } from "./AssetMetaModel";

export class ResolutionModel implements Resolution {
  @Property(String)
  @Required()
  id: string;

  @Property(Number)
  @Integer()
  @Required()
  width: number;

  @Property(Number)
  @Integer()
  @Required()
  height: number;

  @Property(() => AssetMetaModel)
  @Allow(null)
  assetMeta: AssetMetaModel | null;

  @Property(String)
  @Required()
  assetMetaId: string;
}

