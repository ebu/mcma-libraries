import { Authenticator, AccessTokenAuthenticator, AccessTokenProvider, AccessToken, HttpRequestConfig } from "@mcma/client";
import { Configuration, Account } from "@azure/msal";

export interface ConfigurationWithTenant extends Configuration {
    tenant?: string;
}

export interface AzureFunctionKeyAuthContext {
    functionKey: string;
    isEncrypted?: boolean;
}

export class AzureFunctionKeyAuthenticator implements Authenticator {
    constructor(authContext: AzureFunctionKeyAuthContext, decryptionKey?: string);
    sign(config: HttpRequestConfig): void | Promise<void>;
}

export interface AzureAdAuthContext {
    scope: string;
}

export class AzureManagedIdentityAccessTokenProvider implements AccessTokenProvider<AzureAdAuthContext> {
    constructor();
    getAccessToken(authContext: AzureAdAuthContext): Promise<AccessToken>;
}

export class AzureAdPublicClientAccessTokenProvider implements AccessTokenProvider<AzureAdAuthContext> {
    constructor(config: ConfigurationWithTenant, userAccount?: Account);
    getAccessToken(authContext: AzureAdAuthContext): Promise<AccessToken>;
}

declare module "@mcma/client" {
    interface AuthProvider {
        addAzureFunctionKeyAuth(decryptionKey: string): AuthProvider;
        addAzureManagedIdentityAuth(): AuthProvider;
        addAzureAdPublicClientAuth(config: ConfigurationWithTenant, userAccountId?: string): AuthProvider;
    }
}
