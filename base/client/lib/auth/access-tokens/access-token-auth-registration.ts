import { AccessTokenProvider } from "./access-token-provider.js";
import { AccessTokenAuthenticator } from "./access-token-authenticator.js";
import { AuthTypeRegistration } from "../auth-type-registration.js";

export function accessTokenAuth<T>(tokenProvider: AccessTokenProvider<T>, authType?: string, authContext?: T): AuthTypeRegistration {
    return {
        authType: authType || "AccessToken",
        authenticator: new AccessTokenAuthenticator(tokenProvider, authContext)
    };
}
