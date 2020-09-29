import { AccessTokenAuthenticator, AuthTypeRegistration } from "@mcma/client";

import { AzureAdAuthContext } from "../azure-ad-auth-context";
import { AzureAdConfidentialClientAccessTokenProvider } from "./azure-ad-confidential-client-authenticator";
import { ConfigurationWithTenant } from "../configuration-with-tenant";

export function azureAdConfidentialClientAuth(options: ConfigurationWithTenant): AuthTypeRegistration<AzureAdAuthContext> {
    const tokenProvider = new AzureAdConfidentialClientAccessTokenProvider(options);
    return {
        authType: "AzureAD",
        authenticatorFactory: (authContext: AzureAdAuthContext) => new AccessTokenAuthenticator(tokenProvider, authContext)
    };
}
