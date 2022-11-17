import { isArray } from "@tsed/core";
import { deserialize } from "@tsed/json-mapper";
import { Injectable, Inject } from "@tsed/di";
import { PrismaService } from "../services/PrismaService";
import { Prisma, Resolution } from "../client";
import { ResolutionModel } from "../models";

@Injectable()
export class ResolutionsRepository {
  @Inject()
  protected prisma: PrismaService;

  get collection() {
    return this.prisma.resolution
  }

  get groupBy() {
    return this.collection.groupBy.bind(this.collection)
  }

  protected deserialize<T>(obj: null | Resolution | Resolution[]): T {
    return deserialize<T>(obj, { type: ResolutionModel, collectionType: isArray(obj) ? Array : undefined })
  }

  async findUnique(args: Prisma.ResolutionFindUniqueArgs): Promise<ResolutionModel | null> {
    const obj = await this.collection.findUnique(args);
    return this.deserialize<ResolutionModel | null>(obj);
  }

  async findFirst(args: Prisma.ResolutionFindFirstArgs): Promise<ResolutionModel | null> {
    const obj = await this.collection.findFirst(args);
    return this.deserialize<ResolutionModel | null>(obj);
  }

  async findMany(args?: Prisma.ResolutionFindManyArgs): Promise<ResolutionModel[]> {
    const obj = await this.collection.findMany(args);
    return this.deserialize<ResolutionModel[]>(obj);
  }

  async create(args: Prisma.ResolutionCreateArgs): Promise<ResolutionModel> {
    const obj = await this.collection.create(args);
    return this.deserialize<ResolutionModel>(obj);
  }

  async update(args: Prisma.ResolutionUpdateArgs): Promise<ResolutionModel> {
    const obj = await this.collection.update(args);
    return this.deserialize<ResolutionModel>(obj);
  }

  async upsert(args: Prisma.ResolutionUpsertArgs): Promise<ResolutionModel> {
    const obj = await this.collection.upsert(args);
    return this.deserialize<ResolutionModel>(obj);
  }

  async delete(args: Prisma.ResolutionDeleteArgs): Promise<ResolutionModel> {
    const obj = await this.collection.delete(args);
    return this.deserialize<ResolutionModel>(obj);
  }

  async deleteMany(args: Prisma.ResolutionDeleteManyArgs) {
    return this.collection.deleteMany(args)
  }

  async updateMany(args: Prisma.ResolutionUpdateManyArgs) {
    return this.collection.updateMany(args)
  }

  async aggregate(args: Prisma.ResolutionAggregateArgs) {
    return this.collection.aggregate(args)
  }
}
