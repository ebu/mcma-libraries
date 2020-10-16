import { McmaException } from "@mcma/core";
import { Authenticator, HttpRequestConfig } from "@mcma/client";
import { GoogleAuth, GoogleAuthOptions, IdTokenClient } from "google-auth-library";

export class GoogleAuthenticator implements Authenticator {
    private readonly audience: string;
    private readonly googleAuth: GoogleAuth;
    private idTokenClient: IdTokenClient;

    constructor(authContext: GoogleAuthOptions = {}) {
        if (typeof authContext.scopes !== "string") {
            authContext.scopes = (authContext.scopes ?? [])[0] ?? "";
        }
        if (!authContext.scopes.length) {
            throw new McmaException("Invalid value for 'scopes' in auth context. Property must contain exactly one string value.");
        }

        // Google Cloud Functions appear to only support identity tokens, so we need to use audience instead of scope
        // https://cloud.google.com/functions/docs/securing/authenticating
        this.audience = authContext.scopes;
        delete authContext.scopes;

        this.googleAuth = new GoogleAuth(authContext);
    }

    async sign(requestConfig: HttpRequestConfig): Promise<void> {
        if (!this.idTokenClient) {
            this.idTokenClient = await this.googleAuth.getIdTokenClient(this.audience);
        }
        const reqHeaders = await this.idTokenClient.getRequestHeaders();
        requestConfig.headers = Object.assign(requestConfig.headers ?? {}, reqHeaders);
    }
}