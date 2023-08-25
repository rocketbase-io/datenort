import {Context, Middleware, Next, Req} from "@tsed/common";
import {NextFunction} from "express";
import * as JWT from "jsonwebtoken";

import {Unauthorized} from "@tsed/exceptions";
import {ParsedJwtToken} from "../interfaces/ParsedJwtToken";
import {Inject} from "@tsed/di";
import {JwksService} from "../services/JwksService";
import { ParsedJwtPayload } from "src/interfaces/ParsedJwtPayload";

@Middleware()
export class JWTAuthorization {

    //Service injection for caching
    @Inject()
    jwksService: JwksService;
    use(@Req() $req: Req, @Next() next: NextFunction, @Context() ctx: Context) {
        if (!this.jwksService.enabled) {
            return next();
        }

        let authToken : any;
        authToken = $req.headers['authorization'];
        //Check for missing authToken..
        if(!authToken) return next(new Unauthorized("No token found in the request header"));
        //Auth token starts by default with Bearer. This has to be removed.
        authToken = authToken.split(' ')[1];
        if(!authToken) return next(new Unauthorized("No token found in the request header"));

        let decodedToken = <ParsedJwtToken>JWT.decode(authToken, {complete: true});
        const kid = decodedToken.header.kid;
        this.jwksService.jwksClient.getSigningKey(kid, (error, key) => {
            if (error) return next(new Unauthorized(error.message));
            const signingKey = key?.getPublicKey();
            JWT.verify(authToken, signingKey|| "", (err : any) => {
                if (err) return next(new Unauthorized(err.message));
                // Authorization is successful
                ctx.set("tokenPayload", <ParsedJwtPayload>decodedToken.payload);
                return next();
            });
        });
    };
}
