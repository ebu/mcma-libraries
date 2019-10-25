const { Exception } = require("@mcma/core");

class ProviderCollection {
    constructor(providers) {
        this.authProvider = providers && providers.authProvider;
        this.dbTableProvider = providers && providers.dbTableProvider;
        this.environmentVariableProvider = providers && providers.environmentVariableProvider;
        this.loggerProvider = providers && providers.loggerProvider;
        this.resourceManagerProvider = providers && providers.resourceManagerProvider;
    }

    getAuthProvider() {
        if (!this.authProvider) {
            throw new Exception("AuthProvider not available");
        }
        return this.authProvider;
    }

    getDbTableProvider() {
        if (!this.dbTableProvider) {
            throw new Exception("DbTableProvider not available");
        }
        return this.dbTableProvider;
    }

    getEnvironmentVariableProvider() {
        if (!this.environmentVariableProvider) {
            throw new Exception("EnvironmentVariableProvider not available");
        }
        return this.environmentVariableProvider;
    }

    getLoggerProvider() {
        if (!this.loggerProvider) {
            throw new Exception("LoggerProvider not available");
        }
        return this.loggerProvider;
    }

    getResourceManagerProvider() {
        if (!this.resourceManagerProvider) {
            throw new Exception("ResourceManagerProvider not available");
        }
        return this.resourceManagerProvider;
    }
}

module.exports = {
    ProviderCollection
};
