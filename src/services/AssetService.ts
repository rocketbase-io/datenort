import {Inject, Injectable, Service} from "@tsed/di";
import {PrismaService} from "@tsed/prisma";
import {Exception} from "@tsed/exceptions";
import {PlatformMulterFile} from "@tsed/common";
import {ImageProcessingService} from "./ImageProcessingService";
import sizeOf from "image-size";
import {AwsBucketService} from "./AwsBucketService";

@Injectable()
@Service()
export class AssetService {
    @Inject()
    protected prisma: PrismaService;
    @Inject()
    protected processingService: ImageProcessingService;
    @Inject()
    protected awsBucketService : AwsBucketService;

    private readonly includeAll = {meta: true};


    findById(id: string): Object {
        return this.prisma.asset.findUnique({where: {id: id}, include: this.includeAll})
            .catch(error => {
                //Most likely caused by 503 -> Couldn't connect to the database
                return new Exception(503, error);
            });
    }

    findAll(pageOptions: { pageSize: number, page: number }) {
        return this.prisma.asset.findMany({
            skip: pageOptions.pageSize * pageOptions.page,
            take: pageOptions.pageSize,
            include: this.includeAll
        }).catch(error => {
            //Most likely caused by 503 -> Couldn't connect to the database
            return new Exception(503, error);
        });
    }

    async uploadAsset(file: PlatformMulterFile): Promise<Object> {

        //Image processing for relevant data
        const _blurHash     = await this.processingService.blurhashFromFile(file);
        const _imageColors  = await this.processingService.imageColorsFromFile(file);

        this.awsBucketService.uploadFileToBucket("dev-asset-bucket-rcktbs", file);

        return this.prisma.asset.create({
            data: {
                urlPath: "",
                blurHash: _blurHash,
                type: file.mimetype,
                meta: {
                    create: {
                        originalFilename: file.originalname,
                        fileSize: file.size,
                        created: new Date(),
                        referenceUrl: "fdssdfsdffs",
                        resolution: {
                            "width": sizeOf(file.buffer).width,
                            "height": sizeOf(file.buffer).height,
                        },
                        colorPalette: {
                            primary: _imageColors[0],
                            colors: [
                                _imageColors[1],
                                _imageColors[2]
                            ]
                        }
                    }
                }
            },
            include: this.includeAll
        });
    }
}
