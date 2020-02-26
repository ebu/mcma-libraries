import { AccessTokenAuthenticator, AuthTypeRegistration } from "@mcma/client";
import { Account } from "@azure/msal";

import { AzureAdAuthContext } from "../azure-ad-auth-context";
import { ConfigurationWithTenant } from "./configuration-with-tenant";
import { AzureAdPublicClientAccessTokenProvider } from "./azure-ad-public-client-authenticator";

export const azureAdPublicClientAuth = (options: ConfigurationWithTenant, userAccount: Account): AuthTypeRegistration<AzureAdAuthContext> => {
    const tokenProvider = new AzureAdPublicClientAccessTokenProvider(options, userAccount);
    return {
        authType: "AzureAD",
        authenticatorFactory: (authContext: AzureAdAuthContext) => new AccessTokenAuthenticator(tokenProvider, authContext)
    };
};