import {Injectable, Service} from "@tsed/di";
import Imgproxy from "imgproxy";
import {FormattedAsset} from "../interfaces/FormattedAsset";
import {ValidationError} from "@tsed/common";
import * as process from "process";
import { ResizedPreviews } from "src/interfaces/ResizedPreviews";

@Injectable()
@Service()
export class ImageProxyService {
    private readonly imgproxy : Imgproxy;
    constructor() {
        this.imgproxy = new Imgproxy({
            baseUrl: process.env.IMGPROXY_BASEURL || "http://localhost:8080/",
            key: process.env.IMGPROXY_KEY,
            salt: process.env.IMGPROXY_SALT,
            encode: true
        })
    }

    public resizeAsset(asset: FormattedAsset) : ResizedPreviews {
        if(!asset.type.startsWith('image')) throw new ValidationError("Asset is not an image")
        let inBucket : boolean = !!asset.bucket;
        let asReference : boolean = !!asset.referenceUrl && !asset.bucket;
        if(!inBucket && !asReference) throw new ValidationError("Assets not saved via bucket nor as reference");

        /**
         * Following environment variables are needed in the imageproxy docker for S3 bucket access:
         * 1. IMGPROXY_USE_S3
         * 2. IMGPROXY_S3_REGION
         * 3. AWS_ACCESS_KEY_ID
         * 4. AWS_SECRET_ACCESS_KEY
         **/

        // @ts-ignore
        let url : string = inBucket ? `s3://${asset.bucket}/${asset.urlPath}` : asReference ? asset.referenceUrl
            : "https://jfv-asp.de/wp-content/themes/ryse/assets/images/no-image/No-Image-Found-400x264.png"; //Image not found image

        return {
            previews: {
                "xs":   this.imgproxy.builder().resize('fit',  150).generateUrl(url),
                "s":    this.imgproxy.builder().resize('fit',  300).generateUrl(url),
                "m":    this.imgproxy.builder().resize('fit',  600).generateUrl(url),
                "l":    this.imgproxy.builder().resize('fit',  1200).generateUrl(url),
                "xl":   this.imgproxy.builder().resize('fit',  1900).generateUrl(url),
            }
        };
    }
}