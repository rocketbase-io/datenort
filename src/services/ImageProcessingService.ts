import {Injectable} from "@tsed/di";
import {PlatformMulterFile} from "@tsed/common";
import * as blurhash from "blurhash";
import sharp from "sharp";
import getColors from "get-image-colors";
import sizeOf from "image-size";
import {ISizeCalculationResult} from "image-size/dist/types/interface";

@Injectable()
export class ImageProcessingService {
    public blurhashFromFile(file: PlatformMulterFile): Promise<string> {
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
    public imageColorsFromFile(file: PlatformMulterFile) : Promise<string[]> {
        return new Promise((resolve, reject) => {
            getColors(file.buffer, file.mimetype).then(colors => {
                resolve(colors.map(colors => colors.hex()));
            }).catch(error => {
                reject(error);
            })
        })
    }
    
    public imageSizeFromFile(file: PlatformMulterFile) : ISizeCalculationResult {
        return sizeOf(file.buffer);
    }
}
