import {Controller} from "@tsed/di";
import {Get, Post} from "@tsed/schema";
import {MultipartFile, PathParams, PlatformMulterFile, QueryParams, ValidationError} from "@tsed/common";

import * as AssetService from './AssetService'

@Controller("/asset")
export class AssetController {

    @Get("/")
    findAll(@QueryParams("page") page : number,
            @QueryParams("pageSize") pageSize : number) : Promise<Object> {
        return AssetService.findAllAssets(page, pageSize);
    }

    @Get("/:id")
    findByd(@PathParams("id") id : string) : Promise <Object>
    {
        return AssetService.findAssetById(id);
    }

    @Post("/")
    uploadAsset(@MultipartFile("file") file: PlatformMulterFile,
                @QueryParams("systemRefId") systemRefId : string,
                @QueryParams("context") context : string,
                @QueryParams("k_") k_ : string
    ) : Object {
        if(file === undefined) throw new ValidationError("No file was uploaded");
        return AssetService.uploadAsset(file);
    }
}