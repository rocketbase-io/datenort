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
            region: "eu-central-1"
        });

        this.s3 = new AWS.S3();
    }

    private async checkValidBucket(bucket :string) : Promise<boolean | Exception | undefined>{
        const s3 = new AWS.S3();
        const options = {
            Bucket: bucket,
        };

        try {
            await s3.headBucket(options).promise();
            return true;
        } catch(error) {
            throw error;
        }
    };

    public async downloadFileFromBucket(bucket: string, filePath: string) : Promise<any> {
        return new Promise((resolve, reject) => {
            this.s3.getObject({Bucket: bucket, Key: filePath}, (err, data) => {
                if(err) reject(err);
                if(data.Body) resolve(data.Body);
                else reject(err);
            });
        });
    }

    public async deleteFileFromBucket(bucket: string, filePath: string) : Promise<any> {
        return await this.s3.deleteObject({Bucket: bucket, Key: filePath}, (err, data) => {
            if(err) throw new Exception(400, err.message);
            return data;
        }).promise();
    }

    public async uploadFileToBucket(bucket: string, file: PlatformMulterFile, filePath: string) {

        await this.checkValidBucket(bucket).catch(error => {
            throw error;
        });

        return await this.s3.upload({Bucket: bucket, Body: file.buffer, Key: filePath}, async (err, data) => {
            if(err) throw err;
            console.log("Upload success. Data: ", data, " Location: ", data.Location);
        }).promise();
    }
}
