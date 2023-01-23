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
export class JWTAuthorization implements MiddlewareMethods {

    //Service injection for caching
    @Inject()
    jwksService: JwksService;



    authorize({req, asset, bucket}: AuthorizeOptions) : boolean {
        let authToken = req.headers['authorization'];
        if(!authToken) throw new Unauthorized("No token found in the request header");
        authToken = authToken.split(' ')[1];
        let decodedToken = <ParsedJwtToken>JWT.decode(authToken, {complete: true});
        const kid = decodedToken.header.kid;
        this.jwksService.getClient().getSigningKey(kid, (err, key) => {
            if(err) throw new Unauthorized(err.message);
            const signingKey = key?.getPublicKey();
            JWT.verify(authToken || "", signingKey || "", (err : any, user : ParsedJwtPayload) => {
                if(err) throw new Unauthorized(err.message);
            })
        })

        return true;
    }

    use(@Context() $ctx: Context, @Req() $req: Req, @Next() next: NextFunction) {
        let authToken : any;
        let bucket : string = $req.path.split('/').at(-1) || "";

        authToken = $req.headers['authorization'];

        //Check for missing authToken..
        if(!authToken) return next(new Unauthorized("No token found in the request header"));

        //Auth token starts by default with Bearer. This has to be removed.
        authToken = authToken.split(' ')[1];

        let decodedToken = <ParsedJwtToken>JWT.decode(authToken, {complete: true});
        const kid = decodedToken.header.kid;

        this.jwksService.getClient().getSigningKey(kid, (error, key) => {
            if (error) return next(new Unauthorized(error.message));
            const signingKey = key?.getPublicKey();
            JWT.verify(authToken, signingKey|| "", (err : any, user : ParsedJwtPayload ) => {
                if (err) return next(new Unauthorized(err.message));
                const userRoles = user.realm_access.roles;
                const requiredRoles = $ctx.endpoint.store.get(bucket);

                //Check if bucket needs roles
                if(requiredRoles)
                    for (let role of requiredRoles) {
                        if (!userRoles.includes(role)) {
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
        });
    };
}