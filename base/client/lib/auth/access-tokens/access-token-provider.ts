import { AccessToken } from "./access-token.js";

export interface AccessTokenProvider<T> {
    getAccessToken(authContext: T): Promise<AccessToken>;
}
