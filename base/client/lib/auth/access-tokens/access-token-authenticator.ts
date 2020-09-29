import { McmaException } from "@mcma/core";
import { AccessTokenProvider } from "./access-token-provider";
import { Authenticator } from "../authenticator";
import { HttpRequestConfig } from "../../http";
import { AccessToken } from "./access-token";

export class AccessTokenAuthenticator<T> implements Authenticator {
    private accessToken: AccessToken;

    constructor(private tokenProvider: AccessTokenProvider<T>, private authContext: T) {
        // check that the token/provider is valid
        if (!tokenProvider) {
            throw new McmaException("Must provide an access token or access token provider.");
        }
        if (!tokenProvider.getAccessToken) {
            throw new McmaException("Invalid access token or access token provider. Object must define 'accessToken' or 'getAccessToken'.");
        }
    }

    async sign(config: HttpRequestConfig): Promise<void> {
        // check if the access token is expired
        if (this.accessToken && this.accessToken.expiresOn &&
            ((typeof this.accessToken.expiresOn === "number" && Date.now() >= this.accessToken.expiresOn) ||
             (this.accessToken.expiresOn instanceof Date && Date.now() >= this.accessToken.expiresOn.getTime()))) {
            this.accessToken = null;
        }

        // get the access token, if necessary
        if (!this.accessToken) {
            this.accessToken = await this.tokenProvider.getAccessToken(this.authContext);
        }

        // if we still don't have an access token at this point, we cannot proceed
        if (this.accessToken) {
            if (!config.headers) {
                config.headers = {};
            }
            config.headers["Authorization"] = `Bearer ${this.accessToken.accessToken}`; 
        }
    }
}