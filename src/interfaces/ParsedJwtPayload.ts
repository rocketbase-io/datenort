export interface ParsedJwtPayload {
    "exp": number,
    "iat": number,
    "jti": string,
    "iss": string,
    "aud": [string],
    "sub": string,
    "typ": string,
    "azp": string,
    "session_state": string,
    "acr": string,
    "realm_access": {
        "roles": [string]
    },
    "resource_access": {
        "realm-management": {
            "roles": [string]
        },
        "account": {
            "roles": [string]
        }
    },
    "scope": string,
    "sid": string,
    "email_verified": boolean,
    "name": string,
    "preferred_username": string,
    "given_name": string,
    "family_name": string,
    "email": string
}
