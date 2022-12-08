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

            assets.push(await this.uploadAsset(platformFile, bucket));
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

    async uploadAsset(file: PlatformMulterFile | any, bucket: string): Promise<FormattedAsset>  {
        if (!file) throw new ValidationError("No file was uploaded");
        const uuid = randomUUID();

        //Image processing for relevant data
        const isImage = file.mimetype.split('/')[0] == "image";

        let folderPath = uuid;
        folderPath = folderPath.substring(32, 36); //Get last for characters
        folderPath = folderPath.replace(/(.{1})/g, "$1/"); //Insert '/' after every character via regex

        let fileExtension = path.extname(file.originalname);
        let filePath = folderPath + uuid + fileExtension;

        //wait for upload file
        await this.awsBucketService.uploadFileToBucket(bucket, file, filePath)
            .catch(error => {
                console.log(error);
                throw new Exception(error.statusCode, error.statusCode == 403 ? "No authorization for this bucket" : "Bucket does not exist");
            });

        let asset: any;
        asset = {
            data: {
                id: uuid,
                bucket: bucket,
                type: file.mimetype,
                download: `http://0.0.0.0:8083/api/asset/${uuid}/b`,
                urlPath: filePath,
                originalFilename: file.originalname,
                fileSize: file.size,
                created: new Date(),
                referenceUrl: null, //file upload origin -> when downloaded
            }
        };

        if (file.referenceUrl) asset.data['referenceUrl'] = file.referenceUrl;
        if (isImage) {
            const _blurHash = await this.processingService.blurhashFromFile(file).catch(() => console.log("Couldn't process blurHash."));
            const _imageColors = await this.processingService.imageColorsFromFile(file).catch(() => console.log("Couldn't process image colors."));
            const imageWidth = this.processingService.imageSizeFromFile(file).width;
            const imageHeight = this.processingService.imageSizeFromFile(file).height;

            asset.data['blurHash'] = _blurHash;
            asset.data['imageWidth'] = imageWidth;
            asset.data['imageHeight'] = imageHeight;

            //If image colors can be read... Not every filetype is supported
            if (_imageColors) asset.data['colorPalette'] = {
                primary: _imageColors[0],
                colors: [
                    _imageColors[1],
                    _imageColors[2]
                ]
            }
        }

        let rawAsset = await this.prisma.asset.create(asset).catch(err => {
            throw new Exception(400, err);
        });
        
        return this.assetFormatter.format(rawAsset);
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
