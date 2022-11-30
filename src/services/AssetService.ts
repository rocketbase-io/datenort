import {Inject, Injectable, Service} from "@tsed/di";
import {PrismaService} from "@tsed/prisma";
import {BadRequest, Exception} from "@tsed/exceptions";
import {PlatformMulterFile, PlatformResponse} from "@tsed/common";
import {ImageProcessingService} from "./ImageProcessingService";
import {AwsBucketService} from "./AwsBucketService";
import {randomUUID} from "crypto";
import path from "path";

@Injectable()
@Service()
export class AssetService {
    @Inject()
    protected prisma: PrismaService;
    @Inject()
    protected processingService: ImageProcessingService;
    @Inject()
    protected awsBucketService: AwsBucketService;

    private readonly includeAll = {meta: true};

    async downloadAsset(id: string, res: PlatformResponse) : Promise<Buffer> {
        const asset : any = await this.findById(id);
        if(!asset) throw new BadRequest("Couldn't find the asset with the given id.");
        res.attachment(asset.meta.originalFilename);
        res.contentType(asset.type);
        return this.awsBucketService.downloadFileFromBucket(asset.bucket, asset.urlPath);
    }

    findById(id: string): Object {
        return this.prisma.asset.findUnique({
            where: {id: id},
            include: this.includeAll
        }).catch(error => {
            //Most likely caused by 503 -> Couldn't connect to the database
            throw new Exception(503, error);
        });
    }

    findAll(pageOptions: { pageSize: number, page: number, bucket?: string }) {

        let query = {
            skip: pageOptions.pageSize * pageOptions.page,
            take: pageOptions.pageSize,
            include: this.includeAll,
            where: {}
        }
        if (pageOptions.bucket != undefined) query.where = {bucket: pageOptions.bucket};

        return this.prisma.asset.findMany(query).catch(error => {
            //Most likely caused by 503 -> Couldn't connect to the database
            throw new Exception(503, error);
        })
    }

    async uploadAsset(file: PlatformMulterFile, bucket: string): Promise<Object> {

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
                meta: {
                    create: {
                        originalFilename: file.originalname,
                        fileSize: file.size,
                        created: new Date(),
                        referenceUrl: "ursprungs url der datei",
                    }
                }
            },
            include: this.includeAll
        };

        if (isImage) {
            const _blurHash = await this.processingService.blurhashFromFile(file).catch(() => console.log("Couldn't process blurHash."));
            const _imageColors = await this.processingService.imageColorsFromFile(file).catch(() => console.log("Couldn't process image colors."));
            const imageWidth = this.processingService.imageSizeFromFile(file).width;
            const imageHeight = this.processingService.imageSizeFromFile(file).height;

            asset.data['blurHash'] = _blurHash;
            asset.data.meta.create['resolution'] = {
                width: imageWidth,
                height: imageHeight
            }

            //If image colors can be read... Not every filetype is supported
            if (_imageColors) asset.data.meta.create['colorPalette'] = {
                primary: _imageColors[0],
                colors: [
                    _imageColors[1],
                    _imageColors[2]
                ]
            }
        }

        //return asset;

        return this.prisma.asset.create(asset).catch(err => {
            throw new Exception(400, err);
        })
    }

    async updateById(id: string, updatedAsset : any) {

        if(updatedAsset.meta) {
            await this.prisma.assetMeta.update({
                where: { assetId: id },
                data: updatedAsset.meta,
            }).catch(err => {
                throw new Exception(400, err);
            })
            delete updatedAsset.meta;
        }

        return await this.prisma.asset.update({
            where: { id: id },
            data: updatedAsset,
            include: this.includeAll
        }).catch(err => {
            throw new Exception(400, err);
        })
    }

    deleteById(id: string) {
        return this.prisma.asset.delete({
            where: { id: id }
        }).catch(err => {
            throw new Exception(400, err);
        })
    }
}
