import {Controller, Inject} from "@tsed/di";
import {Delete, Get, Post, Put, Returns, Summary} from "@tsed/schema";
import {
    BodyParams, MultipartFile,
    PathParams,
    PlatformMulterFile,
    PlatformResponse,
    QueryParams, Req,
    Res, UseBefore
} from "@tsed/common";

import {AssetService} from "../../services/AssetService";
import {FormattedAsset} from "../../interfaces/FormattedAsset";
import {AssetFindService} from "../../services/AssetFindService";
import {Exception, Unauthorized} from "@tsed/exceptions";
import {ImageProxyService} from "../../services/ImageProxyService";
import {JWTAuthorization} from "../../middleware/JWTAuthorization";

@Controller("/asset")
export class AssetController {

    @Inject()
    protected assetService: AssetService;
    @Inject()
    protected assetFindService: AssetFindService;
    @Inject()
    protected imageProxyService : ImageProxyService;
    @Inject()
    protected jwkService : JWTAuthorization;

    @Get("/resize/:id")
    async resizeAsset(@PathParams("id") id: string) : Promise<any> {
        let asset = await this.assetFindService.findById(id)
        return this.imageProxyService.resizeAsset(asset);
    }

    /**Every GET Request <br>
     * GET every Asset as pageable <br>
     * GET unique Asset by its ID <br>
     * GET the download for an unique Asset by its ID <br>
    * */
    @Get("/")
    @Summary("Get all assets as a pageable. optional: in which bucket")
    @Returns(200, FormattedAsset).Description("Returns an formatted version of an array of assets")
    @UseBefore(JWTAuthorization)
    findAll(@Req() req: Req,
            @QueryParams("page") page?: number,
            @QueryParams("pageSize") pageSize?: number,
            @QueryParams("bucket") bucket?: string) : Promise<FormattedAsset[]> {
        //Check authorization for bucket in query
        return this.assetFindService.findAll({pageSize, page, bucket});
    }

    @Get("/:id")
    @Summary("Get the meta data of an asset by it's ID")
    @UseBefore(JWTAuthorization)
    async findById(@Req() req: Req,
             @PathParams("id") id: string): Promise<FormattedAsset> {
        //Check authorization for found asset with bucket
        return await this.assetFindService.findById(id);
    }

    @Get("/:id/b")
    @Summary("Download a file given by an ID")
    @Returns(200, Buffer).Description("Returns an formatted version of an array of assets")
    @UseBefore(JWTAuthorization)
    async downloadById(@PathParams("id") id: string,
                       @Res() res: PlatformResponse): Promise<Buffer> {
        return await this.assetFindService.downloadAsset(id, res);
    }

    /**Update an Asset by its ID*/
    @Put("/:id")
    @Summary("Update the meta data of an asset by it's ID")
    @UseBefore(JWTAuthorization)
    updateById(@PathParams("id") id: string,
               @BodyParams() updatedAsset: Object) : Promise<FormattedAsset> {
        return this.assetService.updateById(id, updatedAsset);
    }

    /**Delete an Asset by its ID*/
    @Delete("/:id")
    @Summary("Delete a file from the bucket together with its meta data")
    @UseBefore(JWTAuthorization)
    deleteById(@PathParams("id") id: string) : Promise<FormattedAsset>  {
        return this.assetService.deleteById(id);
    }

    @Post("/")
    @Summary("Upload file to bucket and save meta data to the database")
    @Returns(200, FormattedAsset).Description("Formatted Asset")
    @Returns(401, Unauthorized).Description("If JWT Token isn't valid for the bucket")
    @Returns(400, Exception).Description("On Error")
    @UseBefore(JWTAuthorization)
    async uploadAsset(@MultipartFile("file") files: PlatformMulterFile[],
                      @QueryParams("bucket") bucket: string
    ) : Promise<FormattedAsset | FormattedAsset[]> {
        let assets : FormattedAsset[] = [];
        for(let file of files) assets.push(await this.assetService.uploadAsset(file, bucket));
        return files.length == 1 ? assets[0] : assets;
    }

    @Post("/batch/:bucket")
    @Summary("Upload multiple downloaded urls to bucket and save meta data")
    @Returns(200, FormattedAsset).Description("Returns an formatted version of an array of assets")
    @UseBefore(JWTAuthorization)
    async uploadDownloadedAssets(@BodyParams("urls") urls: string[],
                                 @PathParams("bucket") bucket: string
    ) : Promise<FormattedAsset[]> {
        return await this.assetService.batchUpload(urls, bucket);
    }

    @Post("/analyze-file")
    @Summary("No saving or upload. Just analyzing file")
    @Returns(200, FormattedAsset).Description("Return a formatted version of the asset")
    @UseBefore(JWTAuthorization)
    analyzeAssetByFile(@MultipartFile("file") file : PlatformMulterFile) : Promise<FormattedAsset> {
        //no access needed
        return this.assetService.analyzeFile(file);
    }
    @Post("/analyze-url")
    @Summary("No saving or upload. Just analyzing downloaded url")
    @Returns(200, FormattedAsset).Description("Return a formatted version of the asset")
    @UseBefore(JWTAuthorization)
    analyzeAssetByUrl(@BodyParams() body : {url: string}) : Promise<FormattedAsset> {
        //no access needed
        return this.assetService.analyzeUrl(body.url);
    }
    @Post("/analyze-url/save")
    @Summary("Save a file to the database + adding analyzed time")
    @Returns(200, FormattedAsset).Description("Return a formatted version of the asset")
    @UseBefore(JWTAuthorization)
    saveAnalyzedUrl(@BodyParams() body : {url: string}) : Promise<FormattedAsset> {
        //Doesnt need bucket... all access?
        return this.assetService.saveAnalyzedUrl(body.url);
    }
}