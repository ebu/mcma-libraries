class ProviderCollection {
    constructor(providers) {
        this.authProvider = providers && providers.authProvider;
        this.dbTableProvider = providers && providers.dbTableProvider;
        this.environmentVariableProvider = providers && providers.environmentVariableProvider;
        this.loggerProvider = providers && providers.loggerProvider;
        this.resourceManagerProvider = providers && providers.resourceManagerProvider;
    }
}

module.exports = {
    ProviderCollection
};
