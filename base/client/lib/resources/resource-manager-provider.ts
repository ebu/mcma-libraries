import { ContextVariableProvider, EnvironmentVariableProvider, McmaException } from "@mcma/core";
import { AuthProvider } from "../auth";

import { ResourceManagerConfig } from "./resource-manager-config";
import { ResourceManager } from "./resource-manager";
import { getResourceManagerConfig } from "./context-variable-provider-ext";

function isContextVariableProvider(configOrVariableProvider: ResourceManagerConfig | ContextVariableProvider): configOrVariableProvider is ContextVariableProvider {
    return (configOrVariableProvider as any).getRequiredContextVariable !== undefined;
}

export class ResourceManagerProvider {
    constructor(private authProvider: AuthProvider, private defaultConfig?: ResourceManagerConfig) { }

    get(config?: ResourceManagerConfig | ContextVariableProvider) {
        config = config || this.defaultConfig;
        if (!config) {
            config = new EnvironmentVariableProvider();
        }
        if (isContextVariableProvider(config)) {
            config = getResourceManagerConfig(config);
        }
        if (!config) {
            throw new McmaException("Config for resource manager not provided, and there is no default config available");
        }
        return new ResourceManager(config, this.authProvider);
    }
}
