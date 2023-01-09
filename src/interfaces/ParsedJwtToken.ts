import {ParsedJwtPayload} from "./ParsedJwtPayload";

export interface ParsedJwtToken {
    "header": {
        alg: string,
        typ: string,
        kid: string
    },
    "payload": ParsedJwtPayload,
    "signature": string
}
