import { isArray } from "@tsed/core";
import { deserialize } from "@tsed/json-mapper";
import { Injectable, Inject } from "@tsed/di";
import { PrismaService } from "../services/PrismaService";
import { Prisma, Asset } from "../client";
import { AssetModel } from "../models";

@Injectable()
export class AssetsRepository {
  @Inject()
  protected prisma: PrismaService;

  get collection() {
    return this.prisma.asset
  }

  get groupBy() {
    return this.collection.groupBy.bind(this.collection)
  }

  protected deserialize<T>(obj: null | Asset | Asset[]): T {
    return deserialize<T>(obj, { type: AssetModel, collectionType: isArray(obj) ? Array : undefined })
  }

  async findUnique(args: Prisma.AssetFindUniqueArgs): Promise<AssetModel | null> {
    const obj = await this.collection.findUnique(args);
    return this.deserialize<AssetModel | null>(obj);
  }

  async findFirst(args: Prisma.AssetFindFirstArgs): Promise<AssetModel | null> {
    const obj = await this.collection.findFirst(args);
    return this.deserialize<AssetModel | null>(obj);
  }

  async findMany(args?: Prisma.AssetFindManyArgs): Promise<AssetModel[]> {
    const obj = await this.collection.findMany(args);
    return this.deserialize<AssetModel[]>(obj);
  }

  async create(args: Prisma.AssetCreateArgs): Promise<AssetModel> {
    const obj = await this.collection.create(args);
    return this.deserialize<AssetModel>(obj);
  }

  async update(args: Prisma.AssetUpdateArgs): Promise<AssetModel> {
    const obj = await this.collection.update(args);
    return this.deserialize<AssetModel>(obj);
  }

  async upsert(args: Prisma.AssetUpsertArgs): Promise<AssetModel> {
    const obj = await this.collection.upsert(args);
    return this.deserialize<AssetModel>(obj);
  }

  async delete(args: Prisma.AssetDeleteArgs): Promise<AssetModel> {
    const obj = await this.collection.delete(args);
    return this.deserialize<AssetModel>(obj);
  }

  async deleteMany(args: Prisma.AssetDeleteManyArgs) {
    return this.collection.deleteMany(args)
  }

  async updateMany(args: Prisma.AssetUpdateManyArgs) {
    return this.collection.updateMany(args)
  }

  async aggregate(args: Prisma.AssetAggregateArgs) {
    return this.collection.aggregate(args)
  }
}
