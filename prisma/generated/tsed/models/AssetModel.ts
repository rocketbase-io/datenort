import { Asset } from "../client";
import { Required, Property, Allow } from "@tsed/schema";
import { AssetMetaModel } from "./AssetMetaModel";

export class AssetModel implements Asset {
  @Property(String)
  @Required()
  id: string;

  @Property(String)
  @Required()
  urlPath: string;

  @Property(String)
  @Required()
  bucket: string;

  @Property(String)
  @Required()
  type: string;

  @Property(String)
  @Allow(null)
  blurHash: string | null;

  @Property(Object)
  @Allow(null)
  previews: any | null;

  @Property(() => AssetMetaModel)
  @Allow(null)
  meta: AssetMetaModel | null;

  @Property(String)
  @Allow(null)
  download: string | null;
}

