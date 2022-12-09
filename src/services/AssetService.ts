import {Inject, Injectable, Service} from "@tsed/di";
import {PrismaService} from "@tsed/prisma";
import {BadRequest, Exception, NotFound} from "@tsed/exceptions";
import {PlatformMulterFile, PlatformResponse, ValidationError} from "@tsed/common";
import {ImageProcessingService} from "./ImageProcessingService";
import {AwsBucketService} from "./AwsBucketService";
import {randomUUID} from "crypto";
import path from "path";
import {Asset} from "@prisma/client";
import {AssetFormatterService} from "./AssetFormatterService";
import {FormattedAsset} from "../interfaces/FormattedAsset";
import axios from "axios";
import fileType from "file-type"
import {FileInfo} from "../interfaces/FileInfo";

@Injectable()
@Service()
export class AssetService {
    @Inject()
    protected prisma: PrismaService;
    @Inject()
    protected processingService: ImageProcessingService;
    @Inject()
    protected awsBucketService: AwsBucketService;
    @Inject()
    protected assetFormatter: AssetFormatterService;

    async downloadAsset(id: string, res: PlatformResponse) : Promise<Buffer> {
        const asset : any = await this.findById(id);
        res.attachment(asset.originalFilename);
        res.contentType(asset.type);
        return this.awsBucketService.downloadFileFromBucket(asset.bucket, asset.urlPath).catch(err => {
           throw new BadRequest(err.message);
        });
    }

    async downloadAssetFromUrl(url: string) : Promise<Buffer> {
        return new Promise((resolve, reject) => {
            axios.get(url, {responseType: "arraybuffer"}).then(res => {
                resolve(res.data);
            }).catch(err => {
                reject(err);
            })
        })
    }

    async batchUpload(urls: string[], bucket: string) : Promise<FormattedAsset[]> {
        let assets : FormattedAsset[] = [];
        for (let url of urls) {
            let fileBuffer = await this.downloadAssetFromUrl(url);
            let fileName = url.split('/').filter(s=> s != "").reverse()[0];
            let mimeType = (await fileType.fromBuffer(fileBuffer))?.mime;
            let fileExt = (await fileType.fromBuffer(fileBuffer))?.ext;
            if(!mimeType) throw new ValidationError("File type of downloaded url couldn't be determined", ["url: " + url]);

            let platformFile : any = {
                buffer: fileBuffer,
                size: fileBuffer.toString().length,
                mimetype: mimeType,
                originalname: `${fileName}.${fileExt}`,
                referenceUrl: url,
            };

            assets.push(await this.uploadAsset(platformFile, bucket, true));
        }
        return assets;
    }

    async findById(id: string): Promise<FormattedAsset>  {

        let rawAsset: Asset | null = await this.prisma.asset.findUnique({
            where: {id: id}
        }).catch(error => {
            //Most likely caused by 503 -> Couldn't connect to the database
            throw new Exception(503, error);
        });

        if(!rawAsset) throw new NotFound("No asset found with id: " + id, "findById()");
        return this.assetFormatter.format(rawAsset);
    }

    async findAll(pageOptions: { pageSize: number, page: number, bucket?: string }) : Promise<FormattedAsset[]>{

        //If no argument is given -> search for all with page size 5 on page zero
        let query = {
            skip: pageOptions.pageSize || 5 * pageOptions.page | 0,
            take: pageOptions.pageSize || 5,
            where: {}
        }

        if (pageOptions.bucket) query.where = {bucket: pageOptions.bucket};

        let rawAssets = await this.prisma.asset.findMany(query).catch(error => {
            //Most likely caused by 503 -> Couldn't connect to the database
            throw new Exception(503, error);
        });

        return rawAssets.map(rawAsset => this.assetFormatter.format(rawAsset));
    }

    async uploadAsset(file: PlatformMulterFile | any, bucket: string, upload: boolean): Promise<FormattedAsset>  {
        if (!file) throw new ValidationError("No file was uploaded");
        const uuid = randomUUID();

        let folderPath = uuid;
        folderPath = folderPath.substring(32, 36); //Get last for characters
        folderPath = folderPath.replace(/(.{1})/g, "$1/"); //Insert '/' after every character via regex

        let fileExtension = path.extname(file.originalname);
        let filePath = folderPath + uuid + fileExtension;

        //wait for upload file if upload is true
        if(upload) await this.awsBucketService.uploadFileToBucket(bucket, file, filePath)
            .catch(error => {
                console.log(error);
                throw new Exception(error.statusCode, error.statusCode == 403 ? "No authorization for this bucket" : "Bucket does not exist");
            });

        let assetInfo: FileInfo = {
            buffer: file.buffer,
            mimetype: file.mimetype,
            originalname: file.originalname,
            size: file.size,
            referenceUrl: file.referenceUrl
        }

        let asset = await this.processingService.generateAssetInput(assetInfo, {bucket, filePath, uuid});

        let rawAsset = await this.prisma.asset.create(asset).catch(err => {
            throw new Exception(400, err);
        });
        
        return this.assetFormatter.format(rawAsset);
    }

    async analyzeFile(file: FileInfo) {
        let assetInfo: FileInfo = {
            buffer: file.buffer,
            mimetype: file.mimetype,
            originalname: file.originalname,
            size: file.size
        }
        let asset = await this.processingService.generateAssetInput(assetInfo);
        return this.assetFormatter.format(asset.data);
    }

    async analyzeUrl(url: string) {
        let fileBuffer = await this.downloadAssetFromUrl(url);
        let fileName = url.split('/').filter(s=> s != "").reverse()[0];
        let mimeType = (await fileType.fromBuffer(fileBuffer))?.mime;
        let fileExt = (await fileType.fromBuffer(fileBuffer))?.ext;
        if(!mimeType) throw new ValidationError("File type of downloaded url couldn't be determined", ["url: " + url]);

        let assetInfo : FileInfo = {
            buffer: fileBuffer,
            size: fileBuffer.toString().length,
            mimetype: mimeType,
            originalname: `${fileName}.${fileExt}`,
            referenceUrl: url
        };
        let asset = await this.processingService.generateAssetInput(assetInfo);
        return this.assetFormatter.format(asset.data);
    }

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

        await this.awsBucketService.deleteFileFromBucket(rawAsset.bucket, rawAsset.urlPath).catch(err=>{
            throw new BadRequest(err.message);
        });

        return this.assetFormatter.format(rawAsset);
    }
}
