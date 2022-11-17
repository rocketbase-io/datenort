import { isArray } from "@tsed/core";
import { deserialize } from "@tsed/json-mapper";
import { Injectable, Inject } from "@tsed/di";
import { PrismaService } from "../services/PrismaService";
import { Prisma, AssetMeta } from "../client";
import { AssetMetaModel } from "../models";

@Injectable()
export class AssetMetasRepository {
  @Inject()
  protected prisma: PrismaService;

  get collection() {
    return this.prisma.assetMeta
  }

  get groupBy() {
    return this.collection.groupBy.bind(this.collection)
  }

  protected deserialize<T>(obj: null | AssetMeta | AssetMeta[]): T {
    return deserialize<T>(obj, { type: AssetMetaModel, collectionType: isArray(obj) ? Array : undefined })
  }

  async findUnique(args: Prisma.AssetMetaFindUniqueArgs): Promise<AssetMetaModel | null> {
    const obj = await this.collection.findUnique(args);
    return this.deserialize<AssetMetaModel | null>(obj);
  }

  async findFirst(args: Prisma.AssetMetaFindFirstArgs): Promise<AssetMetaModel | null> {
    const obj = await this.collection.findFirst(args);
    return this.deserialize<AssetMetaModel | null>(obj);
  }

  async findMany(args?: Prisma.AssetMetaFindManyArgs): Promise<AssetMetaModel[]> {
    const obj = await this.collection.findMany(args);
    return this.deserialize<AssetMetaModel[]>(obj);
  }

  async create(args: Prisma.AssetMetaCreateArgs): Promise<AssetMetaModel> {
    const obj = await this.collection.create(args);
    return this.deserialize<AssetMetaModel>(obj);
  }

  async update(args: Prisma.AssetMetaUpdateArgs): Promise<AssetMetaModel> {
    const obj = await this.collection.update(args);
    return this.deserialize<AssetMetaModel>(obj);
  }

  async upsert(args: Prisma.AssetMetaUpsertArgs): Promise<AssetMetaModel> {
    const obj = await this.collection.upsert(args);
    return this.deserialize<AssetMetaModel>(obj);
  }

  async delete(args: Prisma.AssetMetaDeleteArgs): Promise<AssetMetaModel> {
    const obj = await this.collection.delete(args);
    return this.deserialize<AssetMetaModel>(obj);
  }

  async deleteMany(args: Prisma.AssetMetaDeleteManyArgs) {
    return this.collection.deleteMany(args)
  }

  async updateMany(args: Prisma.AssetMetaUpdateManyArgs) {
    return this.collection.updateMany(args)
  }

  async aggregate(args: Prisma.AssetMetaAggregateArgs) {
    return this.collection.aggregate(args)
  }
}
