const { HttpClient } = require("./lib/http-client");
const { ResourceEndpointClient } = require("./lib/resource-endpoint-client");
const { ServiceClient } = require("./lib/service-client");
const { ResourceManager, ResourceManagerProvider } = require("./lib/resource-manager");
const { AuthProvider } = require("./lib/auth-provider");
require("./lib/context-variable-provider-ext");

module.exports = {
    HttpClient,
    ResourceEndpointClient,
    ServiceClient,
    ResourceManager,
    ResourceManagerProvider,
    AuthProvider
};