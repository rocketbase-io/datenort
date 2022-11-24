import {Context, Middleware, MiddlewareMethods, Next, Req} from "@tsed/common";
import {NextFunction} from "express";
import * as JWT from "jsonwebtoken";

import {Unauthorized} from "@tsed/exceptions";
import {ParsedJwtToken} from "../interfaces/ParsedJwtToken";
import {ParsedJwtPayload} from "../interfaces/ParsedJwtPayload";
import {Inject} from "@tsed/di";
import {JwksService} from "../services/JwksService";

@Middleware()
export class JWTAuthorization implements MiddlewareMethods {

    //Service injection for caching
    @Inject()
    jwksService: JwksService;

    use(@Context() $ctx: Context, @Req() $req: Req, @Next() next: NextFunction) {
        let authToken = $req.headers['authorization'] || "";
        //Auth token starts by default with Bearer. This has to be removed.
        authToken = authToken.split(' ')[1];

        let decodedToken = <ParsedJwtToken>JWT.decode(authToken, {complete: true});
        const kid = decodedToken.header.kid;

        this.jwksService.getClient().getSigningKey(kid, (error, key) => {
            if (error) return next(new Unauthorized(error.message));
            const signingKey = key?.getPublicKey();
            JWT.verify(authToken, signingKey|| "", (err, user : ParsedJwtPayload ) => {
                if (err) return next(new Unauthorized(err.message));
                const userRoles = user.realm_access.roles;
                const requiredRoles = $ctx.endpoint.store.get("required-roles");
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