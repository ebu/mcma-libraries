import { AuthProvider } from "../auth-provider";
import { AccessTokenProvider } from "./access-token-provider";
import { AccessTokenAuthenticator } from "./access-token-authenticator";

declare module "../auth-provider" {
    interface AuthProvider {
        addAccessTokenAuth<T>(tokenProvider: AccessTokenProvider<T>, authType: string);
    }
}

AuthProvider.prototype.addAccessTokenAuth = function addAccessTokenAuth<T>(tokenProvider: AccessTokenProvider<T>, authType: string) {
    authType = authType || "AccessToken";
    return this.add(authType, (authContext: T) => new AccessTokenAuthenticator<T>(tokenProvider, authContext));
};