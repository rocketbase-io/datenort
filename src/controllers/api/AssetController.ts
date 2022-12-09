import {Controller, Inject} from "@tsed/di";
import {Delete, Get, Post, Put, Summary} from "@tsed/schema";
import {
    BodyParams, MulterOptions,
    MultipartFile,
    PathParams,
    PlatformMulterFile,
    PlatformResponse,
    QueryParams,
    Res
} from "@tsed/common";

import {StoreSet} from "@tsed/core";
import {AssetService} from "../../services/AssetService";
import {FormattedAsset} from "../../interfaces/FormattedAsset";

@Controller("/asset")
export class AssetController {

    @Inject()
    protected assetService: AssetService;

    /**Every GET Request <br>
     * GET every Asset as pageable <br>
     * GET unique Asset by its ID <br>
     * GET the download for an unique Asset by its ID <br>
    * */
    @Get("/")
    @Summary("Get all assets as a pageable. optional: in which bucket")
    findAll(@QueryParams("page") page: number,
            @QueryParams("pageSize") pageSize: number,
            @QueryParams("bucket") bucket?: string) : Promise<FormattedAsset[]> {
        return this.assetService.findAll({pageSize, page, bucket});
    }

    @Get("/:id")
    @Summary("Get the meta data of an asset by it's ID")
    findById(@PathParams("id") id: string): Promise<FormattedAsset> {
        return this.assetService.findById(id);
    }

    @Get("/:id/b")
    @Summary("Download a file given by an ID")
    async downloadById(@PathParams("id") id: string,
                       @Res() res: PlatformResponse): Promise<Buffer> {
        return await this.assetService.downloadAsset(id, res);
    }

    /**Update an Asset by its ID*/
    @Put("/:id")
    @Summary("Update the meta data of an asset by it's ID")
    updateById(@PathParams("id") id: string,
               @BodyParams() updatedAsset: Object) : Promise<FormattedAsset> {
        return this.assetService.updateById(id, updatedAsset);
    }

    /**Delete an Asset by it's ID*/
    @Delete("/:id")
    @Summary("Delete a file from the bucket together with its meta data")
    deleteById(@PathParams("id") id: string) : Promise<FormattedAsset>  {
        return this.assetService.deleteById(id);
    }

    @Post("/")
    @Summary("Upload file to bucket and save meta data to the database")
    //@UseBefore(JWTAuthorization)
    @StoreSet("dev-asset-bucket-rcktbs", ["bucket1-access"])
    uploadAsset(@MultipartFile("file") file: PlatformMulterFile,
                @QueryParams("bucket") bucket: string
    ) : Promise<FormattedAsset> {
        return this.assetService.uploadAsset(file, bucket, true);
    }

    @Post("/multi/")
    @Summary("Upload multiple files to bucket and saves it's meta data to the database")
    async uploadAssets(@MultipartFile("files") files: PlatformMulterFile[],
                       @QueryParams("bucket") bucket: string
    ) : Promise<FormattedAsset[]> {
        let assets : FormattedAsset[] = [];
        for(let file of files) assets.push(await this.assetService.uploadAsset(file, bucket, true));
        return assets;
    }


    @Post("/batch/:bucket")
    async uploadDownloadedAssets(@BodyParams("urls") urls: string[],
                                 @PathParams("bucket") bucket: string
    ) : Promise<any> {
        return await this.assetService.batchUpload(urls, bucket);
    }

    @Post("/analyze-file")
    analyzeAssetByFile(@MultipartFile("file") file : PlatformMulterFile) {
        return this.assetService.analyzeFile(file);
    }
    @Post("/analyze-url")
    analyzeAssetByUrl(@BodyParams() body : {url: string}) {
        return this.assetService.analyzeUrl(body.url);
    }
}