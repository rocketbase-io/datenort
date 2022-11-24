import {Injectable, Service} from "@tsed/di";
import {JwksClient} from "jwks-rsa";
import * as JWKS from "jwks-rsa";

@Injectable()
@Service() //Used for one time constructor (enables caching)
export class JwksService {
    private readonly jwksClient: JwksClient;

    constructor() {
        this.jwksClient = new JWKS.JwksClient({
            cache: true,
            cacheMaxEntries: 5,
            cacheMaxAge: 600000,
            jwksUri: process.env.TOKEN_AUTHORIZATION_URL || "http://fallback.example/"
        });
    }

    public getClient() {
        return this.jwksClient;
    }
}
