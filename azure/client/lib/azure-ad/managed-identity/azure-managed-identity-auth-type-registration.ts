import { AccessTokenAuthenticator, AuthTypeRegistration } from "@mcma/client";
import { AzureManagedIdentityAccessTokenProvider } from "./azure-managed-identity-access-token-provider";
import { AzureAdAuthContext } from "../azure-ad-auth-context";

export function azureAdManagedIdentityAuth(authContext: AzureAdAuthContext): AuthTypeRegistration {
    const tokenProvider = new AzureManagedIdentityAccessTokenProvider();
    return {
        authType: "AzureAD",
        authenticator: new AccessTokenAuthenticator(tokenProvider, authContext)
    };
}
