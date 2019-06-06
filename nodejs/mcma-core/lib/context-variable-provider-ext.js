const { ResourceManager } = require('./mcma-core');
const ContextVariableProvider = require('./context-variable-provider');

ContextVariableProvider.prototype.tableName = function tableName() {
    return this.getRequiredContextVariable('TableName');
};

ContextVariableProvider.prototype.getResourceManagerFromContext = function getResourceManagerFromContext(authProvider) {
    return new ResourceManager({
        servicesUrl: this.getRequiredContextVariable('ServicesUrl'),
        servicesAuthType: this.getOptionalContextVariable('ServicesAuthType'),
        servicesAuthContext: this.getOptionalContextVariable('ServicesAuthContext'),
        authProvider
    });
}