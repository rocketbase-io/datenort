import {Controller, Inject} from "@tsed/di";
import {Delete, Get, Post, Put, Summary} from "@tsed/schema";
import {
    BodyParams,
    MultipartFile,
    PathParams,
    PlatformMulterFile,
    PlatformResponse,
    QueryParams,
    Res,
    ValidationError
} from "@tsed/common";

import {StoreSet} from "@tsed/core";
import {AssetService} from "../../services/AssetService";
import {FormattedAsset} from "../../interfaces/FormattedAsset";

@Controller("/asset")
export class AssetController {

    @Inject()
    protected assetService: AssetService;

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

    @Put("/:id")
    @Summary("Update the meta data of an asset by it's ID")
    updateById(@PathParams("id") id: string,
               @BodyParams() updatedAsset: Object) : Promise<FormattedAsset> {
        return this.assetService.updateById(id, updatedAsset);
    }

    @Delete("/:id")
    @Summary("Delete a file from the bucket together with its meta data")
    deleteById(@PathParams("id") id: string) : Promise<FormattedAsset>  {
        return this.assetService.deleteById(id);
    }

    @Get("/:id/b")
    @Summary("Download a file given by an ID")
    async downloadById(@PathParams("id") id: string,
                       @Res() res: PlatformResponse): Promise<Buffer> {
        return await this.assetService.downloadAsset(id, res);
    }

    @Post("/:bucket")
    @Summary("Upload file to bucket and save meta data to database")
    //@UseBefore(JWTAuthorization)
    @StoreSet("dev-asset-bucket-rcktbs", ["bucket1-access"])
    uploadAsset(@MultipartFile("file") file: PlatformMulterFile,
                @PathParams("bucket") bucket: string
    ) : Promise<FormattedAsset> {
        if (!file) throw new ValidationError("No file was uploaded");
        return this.assetService.uploadAsset(file, bucket);
    }
}