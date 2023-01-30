import {Context, Middleware, MiddlewareMethods, Next, Req} from "@tsed/common";
import {NextFunction} from "express";
import * as JWT from "jsonwebtoken";

import {Unauthorized} from "@tsed/exceptions";
import {ParsedJwtToken} from "../interfaces/ParsedJwtToken";
import {ParsedJwtPayload} from "../interfaces/ParsedJwtPayload";
import {Inject, Injectable, Service} from "@tsed/di";
import {JwksService} from "./JwksService";
import {FormattedAsset} from "../interfaces/FormattedAsset";

type AuthorizeOptions = {
    req: Req;
    asset?: FormattedAsset;
    bucket?: string;
}

@Injectable()
@Service()
export class JWTAuthorization {

    //Service injection for caching
    @Inject()
    jwksService: JwksService;

    authorize({req, asset, bucket}: AuthorizeOptions) {
        return new Promise<void>((resolve, reject) => {
            var authToken = req.headers['authorization']
            // @ts-ignore
            authToken = authToken.split(' ')[1];
            if(!authToken || authToken === "") reject(new Unauthorized("No token found in the request header"));
            let decodedToken = <ParsedJwtToken>JWT.decode(authToken, {complete: true});
            const kid = decodedToken.header.kid;
            this.jwksService.getClient().getSigningKey(kid, (err, key) => {
                if(err) reject(new Unauthorized(err.message));
                const signingKey = key?.getPublicKey();
                JWT.verify(authToken || "", signingKey || "", (err : any, user : ParsedJwtPayload) => {
                    if(err) reject(new Unauthorized(err.message));
                    resolve();
                })
            })
        });
    }
}