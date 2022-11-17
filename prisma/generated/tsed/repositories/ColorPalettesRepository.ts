import { isArray } from "@tsed/core";
import { deserialize } from "@tsed/json-mapper";
import { Injectable, Inject } from "@tsed/di";
import { PrismaService } from "../services/PrismaService";
import { Prisma, ColorPalette } from "../client";
import { ColorPaletteModel } from "../models";

@Injectable()
export class ColorPalettesRepository {
  @Inject()
  protected prisma: PrismaService;

  get collection() {
    return this.prisma.colorPalette
  }

  get groupBy() {
    return this.collection.groupBy.bind(this.collection)
  }

  protected deserialize<T>(obj: null | ColorPalette | ColorPalette[]): T {
    return deserialize<T>(obj, { type: ColorPaletteModel, collectionType: isArray(obj) ? Array : undefined })
  }

  async findUnique(args: Prisma.ColorPaletteFindUniqueArgs): Promise<ColorPaletteModel | null> {
    const obj = await this.collection.findUnique(args);
    return this.deserialize<ColorPaletteModel | null>(obj);
  }

  async findFirst(args: Prisma.ColorPaletteFindFirstArgs): Promise<ColorPaletteModel | null> {
    const obj = await this.collection.findFirst(args);
    return this.deserialize<ColorPaletteModel | null>(obj);
  }

  async findMany(args?: Prisma.ColorPaletteFindManyArgs): Promise<ColorPaletteModel[]> {
    const obj = await this.collection.findMany(args);
    return this.deserialize<ColorPaletteModel[]>(obj);
  }

  async create(args: Prisma.ColorPaletteCreateArgs): Promise<ColorPaletteModel> {
    const obj = await this.collection.create(args);
    return this.deserialize<ColorPaletteModel>(obj);
  }

  async update(args: Prisma.ColorPaletteUpdateArgs): Promise<ColorPaletteModel> {
    const obj = await this.collection.update(args);
    return this.deserialize<ColorPaletteModel>(obj);
  }

  async upsert(args: Prisma.ColorPaletteUpsertArgs): Promise<ColorPaletteModel> {
    const obj = await this.collection.upsert(args);
    return this.deserialize<ColorPaletteModel>(obj);
  }

  async delete(args: Prisma.ColorPaletteDeleteArgs): Promise<ColorPaletteModel> {
    const obj = await this.collection.delete(args);
    return this.deserialize<ColorPaletteModel>(obj);
  }

  async deleteMany(args: Prisma.ColorPaletteDeleteManyArgs) {
    return this.collection.deleteMany(args)
  }

  async updateMany(args: Prisma.ColorPaletteUpdateManyArgs) {
    return this.collection.updateMany(args)
  }

  async aggregate(args: Prisma.ColorPaletteAggregateArgs) {
    return this.collection.aggregate(args)
  }
}
