import { AccessTokenProvider, AccessToken } from "@mcma/client";
import { ManagedIdentityCredential } from "@azure/identity";
import { AzureAdAuthContext } from "../azure-ad-auth-context";

export class AzureManagedIdentityAccessTokenProvider implements AccessTokenProvider<AzureAdAuthContext> {
    private identityCredential = new ManagedIdentityCredential();
    
    async getAccessToken(authContext: AzureAdAuthContext): Promise<AccessToken> {
        const token = await this.identityCredential.getToken(authContext.scope);
        return {
            accessToken: token.token,
            expiresOn: token.expiresOnTimestamp
        };
    }
}