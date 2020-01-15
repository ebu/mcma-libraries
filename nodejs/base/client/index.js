const { HttpClient } = require("./lib/http-client");
const { ResourceEndpointClient } = require("./lib/resource-endpoint-client");
const { ServiceClient } = require("./lib/service-client");
const { ResourceManager, ResourceManagerProvider } = require("./lib/resource-manager");
const { AuthProvider } = require("./lib/auth-provider");
const { McmaHeaders } = require("./lib/headers");
const { AccessTokenAuthenticator } = require("./lib/access-token-authenticator");
require("./lib/context-variable-provider-ext");

module.exports = {
    HttpClient,
    ResourceEndpointClient,
    ServiceClient,
    ResourceManager,
    ResourceManagerProvider,
    AuthProvider,
    McmaHeaders,
    AccessTokenAuthenticator
};