const { Exception } = require("@mcma/core");
const { AuthProvider, AccessTokenAuthenticator } = require("@mcma/client");
const { UserAgentApplication } = require("@azure/msal");

function requiresInteraction(errorCode) {
    if (!errorCode || !errorCode.length) {
        return false;
    }
    return errorCode === "consent_required" ||
        errorCode === "interaction_required" ||
        errorCode === "login_required";
}

class AzureAdPublicClientAccessTokenProvider {
    constructor(options, userAccount) {
        if (!options.auth) {
            throw new Exception("Azure AD public client optiosn must specify an 'auth' object");
        }
        if (options.tenant && !options.auth.authority) {
            options.auth.authority = "https://login.microsoftonline.com/" + options.tenant;
            delete options.tenant;
        }

        const userAgentApplication = new UserAgentApplication(options);
        const scopePromises = {};

        const resolveAccount = () => {
            userAccount = userAccount || userAgentApplication.getAccount();
            return userAccount ? Promise.resolve(userAccount) : userAgentApplication.loginPopup({ scopes: [scope] }).then(authResp => authResp.account);
        };
        
        this.getAccessToken = (authContext) => {
            // ensure scope was provided
            const scope = authContext && authContext.scope;
            if (!scope || scope.length === 0) {
                throw new Exception("Azure AD auth context specify must a scope.");
            }

            if (!scopePromises[scope]) {
                scopePromises[scope] = new Promise((resolve, reject) =>
                    resolveAccount()
                        .then(account =>
                            userAgentApplication.acquireTokenSilent({ scopes: [scope], account })
                                .then(authResp => resolve({
                                    accessToken: authResp.accessToken,
                                    expiresOn: authResp.expiresOn.getTime()
                                }))
                                .catch(error => {
                                    if (requiresInteraction(error.errorCode)) {
                                        userAgentApplication.acquireTokenPopup({ scopes: [scope], account })
                                            .then(authResp => {
                                                userAccount = authResp.account;
                                                
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
                    .finally(() => delete scopePromises[scope]);
            }

            return scopePromises[scope];
        }
    }
}

AuthProvider.prototype.addAzureAdPublicClientAuth = function addAzureAdPublicClientAuth(options, userAccountId) {
    const publicClientTokenProvider = new AzureAdPublicClientAccessTokenProvider(options, userAccountId);
    return this.add("AzureAD", (authContext) => new AccessTokenAuthenticator(publicClientTokenProvider, authContext));
};

module.exports = {
    AzureAdPublicClientAccessTokenProvider
};