import {Context, Middleware, MiddlewareMethods, Next, Req} from "@tsed/common";
import {NextFunction} from "express";
import axios from "axios";
import * as JWT from "jsonwebtoken";
import {BadRequest, Unauthorized} from "@tsed/exceptions";

@Middleware()
export class JWTAuthorization implements MiddlewareMethods{

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