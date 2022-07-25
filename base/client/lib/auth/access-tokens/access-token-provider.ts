import { AccessToken } from "./access-token";

export interface AccessTokenProvider<T> {
    getAccessToken(authContext: T): Promise<AccessToken>;
}
