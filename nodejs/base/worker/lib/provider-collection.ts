import { McmaException, McmaResource, ContextVariableProvider, LoggerProvider } from "@mcma/core";
import { AuthProvider, ResourceManagerProvider } from "@mcma/client";
import { DbTableProvider } from "@mcma/data";

export interface Providers {
    authProvider?: AuthProvider;
    dbTableProvider?: DbTableProvider;
    contextVariableProvider?: ContextVariableProvider;
    loggerProvider?: LoggerProvider;
    resourceManagerProvider?: ResourceManagerProvider;
}

export class ProviderCollection implements Providers {
    private _authProvider: AuthProvider;
    private _dbTableProvider: DbTableProvider;
    private _contextVariableProvider: ContextVariableProvider;
    private _loggerProvider: LoggerProvider;
    private _resourceManagerProvider: ResourceManagerProvider;

    constructor(providers: Providers) {
        this._authProvider = providers?.authProvider;
        this._dbTableProvider = providers?.dbTableProvider;
        this._contextVariableProvider = providers?.contextVariableProvider;
        this._loggerProvider = providers?.loggerProvider;
        this._resourceManagerProvider = providers?.resourceManagerProvider;
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

    get environmentVariableProvider() {
        if (!this._contextVariableProvider) {
            throw new McmaException("EnvironmentVariableProvider not available");
        }
        return this._contextVariableProvider;
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
}