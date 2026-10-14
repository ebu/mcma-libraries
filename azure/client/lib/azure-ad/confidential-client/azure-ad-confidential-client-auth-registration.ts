import { AccessTokenAuthenticator, AuthTypeRegistration } from "@mcma/client";

import { AzureAdAuthContext } from "../azure-ad-auth-context.js";
import { ConfigurationWithTenant } from "../configuration-with-tenant.js";
import { AzureAdConfidentialClientAccessTokenProvider } from "./azure-ad-confidential-client-access-token-provider.js";

export function azureAdConfidentialClientAuth(options: ConfigurationWithTenant, authContext: AzureAdAuthContext): AuthTypeRegistration {
    const tokenProvider = new AzureAdConfidentialClientAccessTokenProvider(options);
    return {
        authType: "AzureAD",
        authenticator: new AccessTokenAuthenticator(tokenProvider, authContext)
    };
}
