import {Inject, Injectable, Service} from "@tsed/di";
import {PrismaService} from "@tsed/prisma";
import {AssetProcessingService} from "./AssetProcessingService";
import {AssetFormatterService} from "./AssetFormatterService";
import {PlatformResponse} from "@tsed/common";
import {BadRequest, Exception, NotFound} from "@tsed/exceptions";
import {FormattedAsset} from "../interfaces/FormattedAsset";
import {Asset} from "@prisma/client";
import {AwsBucketService} from "./AwsBucketService";
import {getBufferFromUrl} from "../utils/utils";

@Injectable()
@Service()
export class AssetFindService {
    @Inject()
    protected prisma: PrismaService;
    @Inject()
    protected processingService: AssetProcessingService;
    @Inject()
    protected assetFormatter: AssetFormatterService;
    @Inject()
    protected awsBucketService: AwsBucketService;

    async downloadAsset(id: string, res: PlatformResponse) : Promise<Buffer> {
        const asset : any = await this.prisma.asset.findUnique({
            where: {id: id}
        }).catch((error : any) => {
            //Most likely caused by 503 -> Couldn't connect to the database
            throw new Exception(503, error);
        });

        if(!asset) throw new NotFound("No asset found with id: " + id, "findById()");

        //res.attachment(asset.originalFilename); //whe uncommented download will instantly start
        res.contentType(asset.type);
        if(asset.bucket && asset.urlPath)
            return this.awsBucketService.downloadFileFromBucket(asset.bucket, asset.urlPath).catch(err => {
                throw new BadRequest(err.message);
            });
        else if(asset.referenceUrl && asset.analyzed) {
            return await getBufferFromUrl(asset.referenceUrl);
        }else{
            throw new NotFound("Couldn't find reference for this asset")
        }
    }

    async findById(id: string): Promise<FormattedAsset>  {

        let rawAsset: Asset | null = await this.prisma.asset.findUnique({
            where: {id: id}
        }).catch((error : any) => {
            //Most likely caused by 503 -> Couldn't connect to the database
            throw new Exception(503, error);
        });

        if(!rawAsset) throw new NotFound("No asset found with id: " + id, "findById()");
        return this.assetFormatter.format(rawAsset);
    }

    async findAll(pageOptions: { pageSize?: number, page?: number, bucket?: string }) : Promise<FormattedAsset[]>{

        //If no argument is given -> search for all with page size 5 on page zero
        let query = {
            skip: (pageOptions.pageSize || 5) * (pageOptions.page || 0),
            take: pageOptions.pageSize || 5,
            where: {}
        }

        if (pageOptions.bucket) query.where = {bucket: pageOptions.bucket};

        let rawAssets = await this.prisma.asset.findMany(query).catch((error : any) => {
            //Most likely caused by 503 -> Couldn't connect to the database
            throw new Exception(503, error);
        });

        return rawAssets.map(rawAsset => this.assetFormatter.format(rawAsset));
    }
}