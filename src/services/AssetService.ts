import {Inject, Injectable, Service} from "@tsed/di";
import {PrismaService} from "@tsed/prisma";
import {BadRequest, Exception, NotFound} from "@tsed/exceptions";
import {PlatformMulterFile, ValidationError} from "@tsed/common";
import {AssetProcessingService} from "./AssetProcessingService";
import {AwsBucketService} from "./AwsBucketService";
import {randomUUID} from "crypto";
import path from "path";
import {Asset} from "@prisma/client";
import {AssetFormatterService} from "./AssetFormatterService";
import {FormattedAsset} from "../interfaces/FormattedAsset";
import {FileInfo} from "../interfaces/FileInfo";
import {getFileFromUrl} from "../utils/utils";

@Injectable()
@Service()
export class AssetService {
    @Inject()
    protected prisma: PrismaService;
    @Inject()
    protected processingService: AssetProcessingService;
    @Inject()
    protected assetFormatter: AssetFormatterService;
    @Inject()
    protected awsBucketService: AwsBucketService;

    async batchUpload(urls: string[], bucket: string) : Promise<FormattedAsset[]> {
        let assets : FormattedAsset[] = [];
        for (let url of urls) {
            let fileInfo = await getFileFromUrl(url);
            fileInfo.analyzed = new Date();
            assets.push(await this.uploadAsset(fileInfo, bucket));
        }
        return assets;
    }

    async saveFileToDB(file: FileInfo) {
        if (!file) throw new ValidationError("No file found");
        const uuid = randomUUID();
        let assetInfo: FileInfo = {
            buffer: file.buffer,
            mimetype: file.mimetype,
            originalname: file.originalname,
            size: file.size,
            referenceUrl: file.referenceUrl,
            analyzed: file.analyzed
        }


        let asset = await this.processingService.generateAssetInput(assetInfo, {uuid});

        let rawAsset = await this.prisma.asset.create(asset).catch(err => {
            throw new Exception(400, err);
        });

        return this.assetFormatter.format(rawAsset);
    }

    async uploadAsset(file: PlatformMulterFile | any, bucket: string): Promise<FormattedAsset>  {
        if (!file) throw new ValidationError("No file found");
        const uuid = randomUUID();

        let folderPath = uuid;
        folderPath = folderPath.substring(32, 36); //Get last for characters
        folderPath = folderPath.replace(/(.{1})/g, "$1/"); //Insert '/' after every character via regex

        let fileExtension = path.extname(file.originalname);
        let filePath = folderPath + uuid + fileExtension;

        //wait for upload file if upload is true
        await this.awsBucketService.uploadFileToBucket(bucket, file, filePath)
            .catch(error => {
                console.log(error);
                throw new Exception(error.statusCode, error.statusCode == 403 ? "No authorization for this bucket" : "Bucket does not exist");
            });

        let assetInfo: FileInfo = {
            buffer: file.buffer,
            mimetype: file.mimetype,
            originalname: file.originalname,
            size: file.size,
            referenceUrl: file.referenceUrl,
        }

        let asset = await this.processingService.generateAssetInput(assetInfo, {bucket: bucket, filePath: filePath, uuid: uuid});

        let rawAsset = await this.prisma.asset.create(asset).catch(err => {
            throw new Exception(400, err);
        });
        
        return this.assetFormatter.format(rawAsset);
    }

    async analyzeFile(file: FileInfo) : Promise<FormattedAsset> {
        let assetInfo: FileInfo = {
            buffer: file.buffer,
            mimetype: file.mimetype,
            originalname: file.originalname,
            size: file.size
        }
        let asset = await this.processingService.generateAssetInput(assetInfo);
        return this.assetFormatter.format(asset.data);
    }

    async analyzeUrl(url: string) : Promise<FormattedAsset> {
        let assetInfo = await getFileFromUrl(url).catch(err => { throw new BadRequest(err.message)});
        let asset = await this.processingService.generateAssetInput(assetInfo);
        return this.assetFormatter.format(asset.data);
    }

    async saveAnalyzedUrl(url: string) : Promise<FormattedAsset>{
        let assetInfo : FileInfo = await getFileFromUrl(url).catch(err => { throw new BadRequest(err.message); });
        assetInfo.analyzed = new Date();
        return await this.saveFileToDB(assetInfo).catch(err => { throw new BadRequest(err.message); });
    }

    //TODO: upadatedAsset type any can cause errors
    async updateById(id: string, updatedAsset : any) : Promise<FormattedAsset>  {
        let rawAsset = await this.prisma.asset.update({
            where: { id: id },
            data: updatedAsset
        }).catch(err => {
            if(err.code === "P2025") throw new NotFound(err.meta.cause);
            throw new BadRequest(err.message);
        });

        return this.assetFormatter.format(rawAsset);
    }
    async deleteById(id: string) : Promise<FormattedAsset>  {
        let rawAsset : Asset = await this.prisma.asset.delete({
            where: { id: id }
        }).catch(err => {
            if(err.code === "P2025") throw new NotFound(err.meta.cause);
            throw new BadRequest(err.message);
        });

        if(rawAsset.bucket) await this.awsBucketService.deleteFileFromBucket(rawAsset.bucket || "", rawAsset.urlPath || "").catch(err=>{
            throw new BadRequest(err.message);
        });

        return this.assetFormatter.format(rawAsset);
    }
}
