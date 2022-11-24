import {Controller, Inject} from "@tsed/di";
import {Get, Post} from "@tsed/schema";
import {MultipartFile, PathParams, PlatformMulterFile, QueryParams, ValidationError} from "@tsed/common";

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
            @QueryParams("pageSize") pageSize : number) : Promise<Object> {
        return this.assetService.findAll({pageSize, page});
    }

    @Get("/:id")
    findByd(@PathParams("id") id : string) : Object {
        return this.assetService.findById(id);
    }

    @Post("/")
    uploadAsset(@MultipartFile("file") file: PlatformMulterFile,
                @QueryParams("systemRefId") systemRefId : string,
                @QueryParams("context") context : string,
                @QueryParams("k_") k_ : string
    ) : Promise<Object> {
        if(file === undefined) throw new ValidationError("No file was uploaded");
        return this.assetService.uploadAsset(file);
    }
}