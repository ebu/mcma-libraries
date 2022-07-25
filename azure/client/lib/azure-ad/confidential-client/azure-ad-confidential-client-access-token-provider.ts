import { McmaException } from "@mcma/core";
import { AccessTokenProvider, AccessToken } from "@mcma/client";
import { ConfidentialClientApplication } from "@azure/msal-node";

import { AzureAdAuthContext } from "../azure-ad-auth-context";
import { ConfigurationWithTenant } from "../configuration-with-tenant";

export class AzureAdConfidentialClientAccessTokenProvider implements AccessTokenProvider<AzureAdAuthContext> {
    private readonly clientApplication: ConfidentialClientApplication;

    constructor(config: ConfigurationWithTenant) {
        if (!config.auth) {
            throw new McmaException("Azure AD public client options must specify an 'auth' object");
        }
        if (config.tenant && !config.auth.authority) {
            config.auth.authority = "https://login.microsoftonline.com/" + config.tenant;
            delete config.tenant;
        }
        this.clientApplication = new ConfidentialClientApplication(config);
    }

    async getAccessToken(authContext: AzureAdAuthContext): Promise<AccessToken> {
        const authResp = await this.clientApplication.acquireTokenByClientCredential({
            scopes: [authContext.scope]
        });

        return {
            accessToken: authResp.accessToken,
            expiresOn: authResp.expiresOn
        };
    }
}
