const WHATWG_URL = require("url");
const { AuthProvider, AccessTokenAuthenticator } = require("@mcma/client");
const { ManagedIdentityCredential } = require("@azure/identity");

class AzureManagedIdentityAccessTokenProvider {
    constructor() {
        const identityCredential = new ManagedIdentityCredential();
    
        this.getAccessToken = async (authContext) => {
            const token = await identityCredential.getToken(authContext.scope);
            return {
                accessToken: token.token,
                expiresOn: token.expiresOnTimestamp
            };
        }
    }
}

AuthProvider.prototype.addAzureAdManagedIdentityAuth = function addAzureAdManagedIdentityAuth() {
    const managedIdentityTokenProvider = new AzureManagedIdentityAccessTokenProvider();
    return this.add("AzureAD", (authContext) => new AccessTokenAuthenticator(managedIdentityTokenProvider, authContext));
};

module.exports = {
    AzureManagedIdentityAccessTokenProvider
};