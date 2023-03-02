import {Injectable, Service} from "@tsed/di";
import {Asset} from "@prisma/client";
import {FormattedAsset} from "../interfaces/FormattedAsset";
import bytes from "bytes";

@Injectable()
@Service()
export class AssetFormatterService {
    private readonly _errorKey = "undefined"; //Use this for undefined values

    public format(rawAsset: Asset): FormattedAsset {
        //Create Object with all necessary keys (they can't be undefined)
        let formattedAsset: FormattedAsset = {
            id: rawAsset.id,
            type: rawAsset.type,
            created: rawAsset.created,
            originalFilename: rawAsset.originalFilename,
            fileSize: rawAsset.fileSize,
            fileSizeHumanReadable: bytes(rawAsset.fileSize),
        };

        //Add conditional keys (i.e. image data)
        if(rawAsset.analyzed) formattedAsset.analyzed = rawAsset.analyzed;
        // todo: formattedAsset.download means in case of s3 file the bucket signed download url / otherwise referenceURL when not stored?
        if(rawAsset.urlPath) formattedAsset.urlPath = rawAsset.urlPath;
        if(rawAsset.bucket) formattedAsset.bucket = rawAsset.bucket;
        if (rawAsset.referenceUrl) formattedAsset.referenceUrl = rawAsset.referenceUrl;
        if (rawAsset.colorPalette &&
            rawAsset.imageWidth &&
            rawAsset.imageHeight) {
            //Adding image data

            formattedAsset.imageData = {
                blurHash: rawAsset.blurHash || this._errorKey,
                colorPalette: {
                    // @ts-ignore
                    primary: rawAsset.colorPalette.primary || this._errorKey,
                    // @ts-ignore
                    colors: rawAsset.colorPalette.colors || this._errorKey
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
