import {Controller} from "@tsed/di";
import {Get, Post, Returns} from "@tsed/schema";
import {
    Context,
    Middleware, MiddlewareMethods,
    MultipartFile, Next,
    PathParams,
    PlatformMulterFile,
    QueryParams, Req, UseBefore,
    ValidationError
} from "@tsed/common";

import * as AssetService from './AssetService'
import {NextFunction} from "express";
import axios from "axios";
import * as JWT from "jsonwebtoken";
import {BadRequest, Exception, Unauthorized} from "@tsed/exceptions";
import {TokenExpiredError} from "jsonwebtoken";
import {StoreSet} from "@tsed/core";

@Middleware()
export class CustomMiddleWare implements MiddlewareMethods{

    use(@Context() $ctx: Context, @Req() $req : Req, @Next() next : NextFunction) {
        const authorizationUrl = process.env.TOKEN_AUTHORIZATION_URL;
        let authToken = $req.headers['authorization'] || "";
        //Auth token starts by default with Bearer. This has to be removed.
        authToken = authToken.split(' ')[1];

        // @ts-ignore
        axios.get(authorizationUrl).then(res=>{
            //Since, the server doesn't add the specific tags when the key starts/ends. It has to be done manually
            const publicKey = "-----BEGIN PUBLIC KEY-----\n" + res.data['public_key'] + "\n-----END PUBLIC KEY-----";

            JWT.verify(authToken, publicKey, { algorithms: ['RS256'] }, (err : any, user : any) => {
                if(err) return next(new Unauthorized(err));
                const userRoles = user.realm_access.roles;
                const requiredRoles = $ctx.endpoint.store.get("required-roles");
                for(let role of requiredRoles) {
                    if(!userRoles.includes(role)) {
                        // @ts-ignore
                        return next(new Unauthorized({
                                                error: "You don't have the required role(s) to access this endpoint",
                                                expected: requiredRoles,
                                                actual: userRoles
                                            }));
                    }
                }

                return next();
            });
        }).catch(error => {
            console.log(error);
            return next(new BadRequest("Couldn't resolve public key from given URL"))
        });
    }


}

@Controller("/asset")
export class AssetController {

    @Get("/")
    @UseBefore(CustomMiddleWare)
    @StoreSet("required-roles", ["bucket1-access"])
    findAll(@QueryParams("page") page : number,
            @QueryParams("pageSize") pageSize : number) : Promise<Object> {
        return AssetService.findAllAssets(page, pageSize);
    }

    @Get("/:id")
    findByd(@PathParams("id") id : string) : Promise <Object> {
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