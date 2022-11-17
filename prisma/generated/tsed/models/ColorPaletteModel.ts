import { ColorPalette } from "../client";
import { Required, Property, CollectionOf, Allow } from "@tsed/schema";
import { AssetMetaModel } from "./AssetMetaModel";

export class ColorPaletteModel implements ColorPalette {
  @Property(String)
  @Required()
  id: string;

  @Property(String)
  @Required()
  primary: string;

  @CollectionOf(String)
  @Required()
  colors: string[];

  @Property(() => AssetMetaModel)
  @Allow(null)
  assetMeta: AssetMetaModel | null;

  @Property(String)
  @Required()
  assetMetaId: string;
}

