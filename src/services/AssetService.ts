import {Inject, Injectable} from "@tsed/di";
import {PrismaService} from "@tsed/prisma";
import {Exception} from "@tsed/exceptions";
import {PlatformMulterFile} from "@tsed/common";
import {BlurHashService} from "./BlurHashService";
import sizeOf from "image-size";

@Injectable()
export class AssetService {
    @Inject()
    protected prisma: PrismaService;
    @Inject()
    protected blurHash: BlurHashService;

    private readonly includeAll = {meta: true};

    getAll(pageOptions: { pageSize: number, page: number }) {
        return this.prisma.asset.findMany({
            skip: pageOptions.pageSize * pageOptions.page,
            take: pageOptions.pageSize,
            include: this.includeAll
        }).catch(error => {
            //Most likely caused by 503 -> Couldn't connect to the database
            throw new Exception(503, error);
        });
    }

    async saveAsset(file: PlatformMulterFile) : Promise<Object> {
        return this.prisma.asset.create({
            data: {
                urlPath: "",
                blurHash: await this.blurHash.getFromFile(file),
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
                            primary: "#43892",
                            colors: [
                                "#23892",
                                "#43289"
                            ]
                        }
                    }
                }
            },
            include: this.includeAll
        });
    }
}
