import { AccessTokenAuthenticator, AuthTypeRegistration } from "@mcma/client";
import { AccountInfo } from "@azure/msal-browser";

import { AzureAdAuthContext } from "./azure-ad-auth-context";
import { ConfigurationWithTenant } from "./configuration-with-tenant";
import { AzureAdPublicClientAccessTokenProvider } from "./azure-ad-public-client-authenticator";

export function azureAdPublicClientAuth(options: ConfigurationWithTenant, userAccount: AccountInfo): AuthTypeRegistration<AzureAdAuthContext> {
    const tokenProvider = new AzureAdPublicClientAccessTokenProvider(options, userAccount);
    return {
        authType: "AzureAD",
        authenticatorFactory: (authContext: AzureAdAuthContext) => new AccessTokenAuthenticator(tokenProvider, authContext)
    };
}
