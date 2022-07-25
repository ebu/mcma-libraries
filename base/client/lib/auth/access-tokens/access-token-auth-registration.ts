import { AccessTokenProvider } from "./access-token-provider";
import { AccessTokenAuthenticator } from "./access-token-authenticator";
import { AuthTypeRegistration } from "../auth-type-registration";

export function accessTokenAuth<T>(tokenProvider: AccessTokenProvider<T>, authType?: string, authContext?: T): AuthTypeRegistration {
    return {
        authType: authType || "AccessToken",
        authenticator: new AccessTokenAuthenticator(tokenProvider, authContext)
    };
}
