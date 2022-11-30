import {Controller, Inject} from "@tsed/di";
import {Get, Post} from "@tsed/schema";
import {
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

@Controller("/asset")
export class AssetController {

    @Inject()
    protected assetService : AssetService;

    @Get("/")
    //@UseBefore(JWTAuthorization)
    @StoreSet("required-roles", ["bucket1-access"])
    findAll(@QueryParams("page") page : number,
            @QueryParams("pageSize") pageSize : number,
            @QueryParams("bucket") bucket? : string) : Promise<Object> {
        return this.assetService.findAll({pageSize, page, bucket});
    }

    @Get("/:id")
    findById(@PathParams("id") id : string) : Object {
        return this.assetService.findById(id);
    }

    @Get("/:id/b")
    async downloadById(@PathParams("id") id: string,
                       @Res() res: PlatformResponse) : Promise<Buffer> {
        return await this.assetService.downloadAsset(id, res);
    }

    @Post("/:bucket")
    uploadAsset(@MultipartFile("file") file: PlatformMulterFile,
                @PathParams("bucket") bucket: string,
                @QueryParams("systemRefId") systemRefId : string,
                @QueryParams("context") context : string,
                @QueryParams("k_") k_ : string
    ) : Promise<Object> {
        if(file === undefined) throw new ValidationError("No file was uploaded");
        return this.assetService.uploadAsset(file, bucket);
    }
}