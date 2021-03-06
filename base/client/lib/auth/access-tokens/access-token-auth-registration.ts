import { AccessTokenProvider } from "./access-token-provider";
import { AccessTokenAuthenticator } from "./access-token-authenticator";
import { AuthTypeRegistration } from "../auth-type-registration";

export function accessTokenAuth<T>(tokenProvider: AccessTokenProvider<T>, authType?: string): AuthTypeRegistration<T> {
    return {
        authType: authType || "AccessToken",
        authenticatorFactory: (authContext: T) => new AccessTokenAuthenticator<T>(tokenProvider, authContext)
    };
}