import {Injectable, Service} from "@tsed/di";
import {JwksClient} from "jwks-rsa";
import * as JWKS from "jwks-rsa";

@Injectable()
@Service() //Used for one time constructor (enables caching)
export class JwksService {
    public readonly jwksClient: JwksClient;
    public readonly enabled: boolean;

    constructor() {
        this.enabled = "TOKEN_AUTHORIZATION_URL" in process.env;
        if (this.enabled) {
            this.jwksClient = new JWKS.JwksClient({
                cache: true,
                cacheMaxEntries: 5,
                cacheMaxAge: 600000,
                jwksUri: process.env.TOKEN_AUTHORIZATION_URL!
            });
        }
    }
}
