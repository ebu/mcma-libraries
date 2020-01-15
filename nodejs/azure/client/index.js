const { AzureFunctionKeyAuthenticator } = require("./lib/azure-function-key-authenticator");
const { AzureManagedIdentityAccessTokenProvider } = require("./lib/azure-managed-identity-authenticator");
const { AzureAdPublicClientAccessTokenProvider } = require("./lib/azure-ad-public-client-authenticator");

module.exports = {
    AzureFunctionKeyAuthenticator,
    AzureManagedIdentityAccessTokenProvider,
    AzureAdPublicClientAccessTokenProvider
};