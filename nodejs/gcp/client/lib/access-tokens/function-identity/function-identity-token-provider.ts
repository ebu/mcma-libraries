import { AccessTokenProvider, AccessToken, HttpClient, HttpRequestConfig } from "@mcma/client";

import { FunctionIdentityAuthContext } from "./function-identity-auth-context";

const defaultMetadataUrl = "http://metadata/computeMetadata/v1/instance/service-accounts/default/identity";

export class FunctionIdentityTokenProvider implements AccessTokenProvider<FunctionIdentityAuthContext> {
    private httpClient = new HttpClient();

    async getAccessToken(authContext: FunctionIdentityAuthContext): Promise<AccessToken> {
        const metadataUrl = authContext.metadataUrl ?? defaultMetadataUrl;

        const config: HttpRequestConfig = {
            headers: {
                "Metadata-Flavor": "Google"
            },
            params: {
                audience: authContext.audience
            }
        };

        const resp = await this.httpClient.get<string>(metadataUrl, config);

        return {
            accessToken: resp.data,
            expiresOn: 0
        };
    }

}
