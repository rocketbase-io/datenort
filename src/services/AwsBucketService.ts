import {Injectable, Service} from "@tsed/di";
import * as AWS from "aws-sdk";
import {PlatformMulterFile} from "@tsed/common";
import {Exception} from "@tsed/exceptions";

@Injectable()
@Service()
export class AwsBucketService {

    private readonly s3: AWS.S3;

    constructor() {
        AWS.config.update({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        });

        this.s3 = new AWS.S3();
    }

    uploadFileToBucket(bucket: string, file: PlatformMulterFile) {
        return this.s3.upload({Bucket: bucket, Body: file.buffer, Key: file.originalname}, (err, data) => {
            if(err) return new Exception(400, err.message);
            console.log("Upload success. Data: ", data, " Location: ", data.Location);
        });
    }
}
