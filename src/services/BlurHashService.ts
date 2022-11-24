import {Injectable, Service} from "@tsed/di";
import {PlatformMulterFile} from "@tsed/common";
import * as blurhash from "blurhash";
import sharp from "sharp";

@Injectable()
export class BlurHashService {
    public getFromFile(file: PlatformMulterFile): Promise<string> {
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
}
