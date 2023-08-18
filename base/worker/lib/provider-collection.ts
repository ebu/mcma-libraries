import { LoggerProvider, McmaException } from "@mcma/core";
import { AuthProvider, ResourceManagerProvider } from "@mcma/client";
import { DocumentDatabaseTableProvider } from "@mcma/data";
import { SecretsProvider } from "@mcma/secrets";

export interface Providers {
    authProvider?: AuthProvider;
    dbTableProvider?: DocumentDatabaseTableProvider;
    loggerProvider?: LoggerProvider;
    resourceManagerProvider?: ResourceManagerProvider;
    secretsProvider?: SecretsProvider;
}

export class ProviderCollection implements Providers {
    private readonly _authProvider: AuthProvider;
    private readonly _dbTableProvider: DocumentDatabaseTableProvider;
    private readonly _loggerProvider: LoggerProvider;
    private readonly _resourceManagerProvider: ResourceManagerProvider;
    private readonly _secretsProvider: SecretsProvider;

    constructor(providers: Providers) {
        this._authProvider = providers?.authProvider;
        this._dbTableProvider = providers?.dbTableProvider;
        this._loggerProvider = providers?.loggerProvider;
        this._resourceManagerProvider = providers?.resourceManagerProvider;
        this._secretsProvider = providers?.secretsProvider;
    }

    get authProvider() {
        if (!this._authProvider) {
            throw new McmaException("AuthProvider not available");
        }
        return this._authProvider;
    }

    get dbTableProvider() {
        if (!this._dbTableProvider) {
            throw new McmaException("DbTableProvider not available");
        }
        return this._dbTableProvider;
    }

    get loggerProvider() {
        if (!this._loggerProvider) {
            throw new McmaException("LoggerProvider not available");
        }
        return this._loggerProvider;
    }

    get resourceManagerProvider() {
        if (!this._resourceManagerProvider) {
            throw new McmaException("ResourceManagerProvider not available");
        }
        return this._resourceManagerProvider;
    }

    get secretsProvider() {
        if (!this._secretsProvider) {
            throw new McmaException("SecretsProvider not available");
        }
        return this._secretsProvider;
    }
}
