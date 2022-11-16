import {Controller} from "@tsed/di";
import {Get, Post} from "@tsed/schema";
import {MultipartFile, PlatformMulterFile, QueryParams, ValidationError} from "@tsed/common";

import * as AssetService from './AssetService'

@Controller("/asset")
export class AssetController {
    @Get("/")
    findAll() {

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