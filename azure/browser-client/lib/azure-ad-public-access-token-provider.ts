import { McmaException } from "@mcma/core";
import { AccessTokenProvider, AccessToken } from "@mcma/client";
import { PublicClientApplication, AccountInfo } from "@azure/msal-browser";

import { AzureAdAuthContext } from "./azure-ad-auth-context";
import { ConfigurationWithTenant } from "./configuration-with-tenant";

function requiresInteraction(errorCode: string): boolean {
    if (!errorCode || !errorCode.length) {
        return false;
    }

    return errorCode === "consent_required" ||
        errorCode === "interaction_required" ||
        errorCode === "login_required";
}

export class AzureAdPublicClientAccessTokenProvider implements AccessTokenProvider<AzureAdAuthContext> {
    private readonly publicClientApplication: PublicClientApplication;
    private readonly scopePromises: { [key: string]: Promise<any> } = {};

    constructor(options: ConfigurationWithTenant, private userAccount?: AccountInfo) {
        if (!options.auth) {
            throw new McmaException("Azure AD public client options must specify an 'auth' object");
        }
        if (options.tenant && !options.auth.authority) {
            options.auth.authority = "https://login.microsoftonline.com/" + options.tenant;
            delete options.tenant;
        }

        this.publicClientApplication = new PublicClientApplication(options);
        this.scopePromises = {};
    }

    private resolveAccount(scope: string): Promise<AccountInfo> {
        return this.userAccount
            ? Promise.resolve(this.userAccount)
            : this.publicClientApplication.loginPopup({ scopes: [scope] }).then(authResp => authResp.account);
    }
        
    getAccessToken(authContext: AzureAdAuthContext): Promise<AccessToken> {
        // ensure scope was provided
        const scope = authContext && authContext.scope;
        if (!scope || scope.length === 0) {
            throw new McmaException("Azure AD auth context specify must a scope.");
        }

        if (!this.scopePromises[scope]) {
            this.scopePromises[scope] = new Promise((resolve, reject) =>
                this.resolveAccount(scope)
                    .then((account: AccountInfo) =>
                        this.publicClientApplication.acquireTokenSilent({ scopes: [scope], account })
                            .then(authResp => resolve({
                                accessToken: authResp.accessToken,
                                expiresOn: authResp.expiresOn.getTime()
                            }))
                            .catch(error => {
                                if (requiresInteraction(error.errorCode)) {
                                    this.publicClientApplication.acquireTokenPopup({ scopes: [scope] })
                                        .then(authResp => {
                                            this.userAccount = authResp.account;
                                            
                                            resolve({
                                                accessToken: authResp.accessToken,
                                                expiresOn: authResp.expiresOn.getTime()
                                            });
                                        })
                                        .catch(innerError => reject(innerError));
                                } else {
                                    reject(error);
                                }
                            })
                    )
                    .catch(err => reject(err))
                )
                .finally(() => delete this.scopePromises[scope]);
        }

        return this.scopePromises[scope];
    }
}
