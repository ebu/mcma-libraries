const { ContextVariableProvider } = require("@mcma/core");

ContextVariableProvider.prototype.getResourceManagerConfig = function getResourceManagerConfig() {
    return {
        servicesUrl: this.getRequiredContextVariable("ServicesUrl"),
        servicesAuthType: this.getOptionalContextVariable("ServicesAuthType"),
        servicesAuthContext: this.getOptionalContextVariable("ServicesAuthContext")
    };
}