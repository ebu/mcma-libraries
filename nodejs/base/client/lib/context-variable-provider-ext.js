const { ContextVariableProvider } = require("@mcma/core");
const { ResourceManager } = require("./resource-manager");

ContextVariableProvider.prototype.getResourceManagerFromContext = function getResourceManagerFromContext(authProvider) {
    return new ResourceManager({
        servicesUrl: this.getRequiredContextVariable("ServicesUrl"),
        servicesAuthType: this.getOptionalContextVariable("ServicesAuthType"),
        servicesAuthContext: this.getOptionalContextVariable("ServicesAuthContext"),
        authProvider
    });
}