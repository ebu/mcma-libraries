import { AccessTokenAuthenticator, AuthTypeRegistration } from "@mcma/client";
import { AzureManagedIdentityAccessTokenProvider } from "./azure-managed-identity-authenticator";
import { AzureAdAuthContext } from "../azure-ad-auth-context";

export function azureAdManagedIdentityAuth(): AuthTypeRegistration<AzureAdAuthContext> {
    const tokenProvider = new AzureManagedIdentityAccessTokenProvider();
    return {
        authType: "AzureAD",
        authenticatorFactory: (authContext: AzureAdAuthContext) => new AccessTokenAuthenticator(tokenProvider, authContext)
    };
}
