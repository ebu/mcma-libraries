const { HttpClient } = require("./lib/http-client");
const { ResourceEndpointClient } = require("./lib/resource-endpoint-client");
const { ServiceClient } = require("./lib/service-client");
const { ResourceManager } = require("./lib/resource-manager");
const { AuthenticatorProvider } = require("./lib/authenticator-provider");
require("./lib/context-variable-provider-ext");

module.exports = {
    HttpClient,
    ResourceEndpointClient,
    ServiceClient,
    ResourceManager,
    AuthenticatorProvider
};