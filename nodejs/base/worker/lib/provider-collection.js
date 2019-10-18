class ProviderCollection {
    constructor(dbTableProvider, environmentVariableProvider, loggerProvider, resourceManagerProvider) {
        this.dbTableProvider = dbTableProvider;
        this.environmentVariableProvider = environmentVariableProvider;
        this.loggerProvider = loggerProvider;
        this.resourceManagerProvider = resourceManagerProvider;
    }
}

module.exports = {
    ProviderCollection
};
