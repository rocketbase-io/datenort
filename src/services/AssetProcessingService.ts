import {Injectable} from "@tsed/di";
import * as blurhash from "blurhash";
import sharp from "sharp";
import getColors from "get-image-colors";
import sizeOf from "image-size";
import {ISizeCalculationResult} from "image-size/dist/types/interface";
import {FileInfo} from "../interfaces/FileInfo";

@Injectable()
export class AssetProcessingService {
    public blurhashFromFile(file: FileInfo): Promise<string> {
        return new Promise((resolve, reject) => {
            sharp(file.buffer)
                .raw()
                .ensureAlpha()
                .resize(64, 64, {fit: "inside"})
                .toBuffer((err, buffer, {width, height}) => {
                    if (err) return reject(err);
                    resolve(blurhash.encode(new Uint8ClampedArray(buffer), width, height, 4, 4));
                })
        });
    }
    public imageColorsFromFile(file: FileInfo) : Promise<string[]> {
        return new Promise((resolve, reject) => {
            getColors(file.buffer, file.mimetype).then(colors => {
                resolve(colors.map(colors => colors.hex()));
            }).catch(error => {
                reject(error);
            })
        })
    }
    
    public imageSizeFromFile(file: FileInfo) : ISizeCalculationResult {
        return sizeOf(file.buffer);
    }

    public async generateAssetInput(file: FileInfo, options?: {bucket?: string | undefined, uuid: string | undefined, filePath?: string | undefined}) : Promise<any> {
        //Image processing for relevant data
        const isImage = file.mimetype.split('/')[0] == "image";

        let asset: any;
        asset = {
            data: {
                type: file.mimetype,
                originalFilename: file.originalname,
                fileSize: file.size,
                created: new Date(),

            }
        };

        if(file.referenceUrl) asset.data['referenceUrl'] = file.referenceUrl;
        if(file.analyzed) asset.data['analyzed'] = file.analyzed;
        if(options) {
            asset.data['id'] = options.uuid;
            if(options.bucket) {
                asset.data['bucket'] = options.bucket;
                asset.data['download'] = `http://0.0.0.0:8083/api/asset/${options.uuid}/b`
            }
            if(options.filePath) asset.data['urlPath'] = options.filePath;
        }

        if (file.referenceUrl) asset.data['referenceUrl'] = file.referenceUrl;
        if (isImage) {
            const _blurHash = await this.blurhashFromFile(file).catch(() => console.log("Couldn't process blurHash."));
            const _imageColors = await this.imageColorsFromFile(file).catch(() => console.log("Couldn't process image colors."));
            const imageWidth = this.imageSizeFromFile(file).width;
            const imageHeight = this.imageSizeFromFile(file).height;

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

        return asset;
    }
}
