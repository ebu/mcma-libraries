import { AccessTokenAuthenticator, AuthTypeRegistration } from "@mcma/client";
import { AccountInfo } from "@azure/msal-browser";

import { AzureAdAuthContext } from "./azure-ad-auth-context";
import { ConfigurationWithTenant } from "./configuration-with-tenant";
import { AzureAdPublicClientAccessTokenProvider } from "./azure-ad-public-access-token-provider";

export function azureAdPublicClientAuth(options: ConfigurationWithTenant, userAccount: AccountInfo, authContext: AzureAdAuthContext): AuthTypeRegistration {
    const tokenProvider = new AzureAdPublicClientAccessTokenProvider(options, userAccount);
    return {
        authType: "AzureAD",
        authenticator: new AccessTokenAuthenticator(tokenProvider, authContext)
    };
}
