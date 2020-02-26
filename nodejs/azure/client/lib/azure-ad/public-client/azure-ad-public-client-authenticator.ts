import { Exception } from "@mcma/core";
import { AccessTokenProvider, AccessToken } from "@mcma/client";
import { UserAgentApplication, Account } from "@azure/msal";

import { ConfigurationWithTenant } from "./configuration-with-tenant";
import { AzureAdAuthContext } from "../azure-ad-auth-context";

export class AzureAdPublicClientAccessTokenProvider implements AccessTokenProvider<AzureAdAuthContext> {
    private userAgentApplication: UserAgentApplication;
    private scopePromises: { [key: string]: Promise<any> } = {};

    constructor(options: ConfigurationWithTenant, private userAccount?: Account) {
        if (!options.auth) {
            throw new Exception("Azure AD public client options must specify an 'auth' object");
        }
        if (options.tenant && !options.auth.authority) {
            options.auth.authority = "https://login.microsoftonline.com/" + options.tenant;
            delete options.tenant;
        }

        this.userAgentApplication = new UserAgentApplication(options);
        this.scopePromises = {};
    }
    
    private requiresInteraction(errorCode: string): boolean {
        if (!errorCode || !errorCode.length) {
            return false;
        }

        return errorCode === "consent_required" ||
               errorCode === "interaction_required" ||
               errorCode === "login_required";
    }

    private resolveAccount(scope: string): Promise<Account> {
        this.userAccount = this.userAccount || this.userAgentApplication.getAccount();

        return this.userAccount
            ? Promise.resolve(this.userAccount)
            : this.userAgentApplication.loginPopup({ scopes: [scope] }).then(authResp => authResp.account);
    }
        
    getAccessToken(authContext: AzureAdAuthContext): Promise<AccessToken> {
        // ensure scope was provided
        const scope = authContext && authContext.scope;
        if (!scope || scope.length === 0) {
            throw new Exception("Azure AD auth context specify must a scope.");
        }

        if (!this.scopePromises[scope]) {
            this.scopePromises[scope] = new Promise((resolve, reject) =>
                this.resolveAccount(scope)
                    .then((account: Account) =>
                        this.userAgentApplication.acquireTokenSilent({ scopes: [scope], account })
                            .then(authResp => resolve({
                                accessToken: authResp.accessToken,
                                expiresOn: authResp.expiresOn.getTime()
                            }))
                            .catch(error => {
                                if (this.requiresInteraction(error.errorCode)) {
                                    this.userAgentApplication.acquireTokenPopup({ scopes: [scope], account })
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
