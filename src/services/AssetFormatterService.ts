import {Injectable, Service} from "@tsed/di";
import {Asset} from "@prisma/client";
import {FormattedAsset} from "../interfaces/FormattedAsset";
import bytes from "bytes";

@Injectable()
@Service()
export class AssetFormatterService {
    format(rawAsset: Asset): FormattedAsset {
        //Create Object with all necessary keys (they can't be undefined)
        let formattedAsset: FormattedAsset = {
            id: rawAsset.id,
            urlPath: rawAsset.urlPath,
            bucket: rawAsset.bucket,
            type: rawAsset.type,
            created: rawAsset.created,
            originalFilename: rawAsset.originalFilename,
            fileSize: bytes(rawAsset.fileSize),
            download: rawAsset.download,
        };

        //Add conditional keys (i.e. image data)
        if (rawAsset.referenceUrl) formattedAsset.referenceUrl = rawAsset.referenceUrl;
        if (rawAsset.colorPalette &&
            rawAsset.imageWidth &&
            rawAsset.imageHeight) {
            //Adding image data

            formattedAsset.imageData = {
                blurHash: rawAsset.blurHash || "undefined",
                colorPalette: {
                    // @ts-ignore
                    primary: rawAsset.colorPalette.primary || undefined,
                    // @ts-ignore
                    colors: rawAsset.colorPalette.colors || undefined
                },
                resolution: {
                    width: rawAsset.imageWidth,
                    height: rawAsset.imageHeight
                }
            }
        }

        return formattedAsset;
    }
}
